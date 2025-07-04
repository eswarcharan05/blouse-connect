import {
  users,
  tailors,
  orders,
  reviews,
  courses,
  enrollments,
  notifications,
  type User,
  type UpsertUser,
  type InsertTailor,
  type Tailor,
  type TailorWithUser,
  type InsertOrder,
  type Order,
  type OrderWithDetails,
  type InsertReview,
  type Review,
  type ReviewWithDetails,
  type InsertCourse,
  type Course,
  type InsertEnrollment,
  type Enrollment,
  type InsertNotification,
  type Notification,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, desc, asc, gte, lte, ilike, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Tailor operations
  createTailor(tailor: InsertTailor): Promise<Tailor>;
  getTailor(id: number): Promise<TailorWithUser | undefined>;
  getTailorByUserId(userId: string): Promise<TailorWithUser | undefined>;
  getTailorsNearby(lat: number, lng: number, radius: number): Promise<TailorWithUser[]>;
  updateTailor(id: number, updates: Partial<InsertTailor>): Promise<Tailor | undefined>;
  updateTailorRating(tailorId: number): Promise<void>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrder(id: number): Promise<OrderWithDetails | undefined>;
  getUserOrders(userId: string): Promise<OrderWithDetails[]>;
  getTailorOrders(tailorId: number): Promise<OrderWithDetails[]>;
  updateOrderStatus(id: number, status: string, progress?: number): Promise<Order | undefined>;
  updateOrderPrice(id: number, price: number): Promise<Order | undefined>;
  
  // Review operations
  createReview(review: InsertReview): Promise<Review>;
  getTailorReviews(tailorId: number): Promise<ReviewWithDetails[]>;
  getOrderReview(orderId: number): Promise<Review | undefined>;
  
  // Course operations
  createCourse(course: InsertCourse): Promise<Course>;
  getCourse(id: number): Promise<Course | undefined>;
  getCourses(): Promise<Course[]>;
  updateCourse(id: number, updates: Partial<InsertCourse>): Promise<Course | undefined>;
  
  // Enrollment operations
  createEnrollment(enrollment: InsertEnrollment): Promise<Enrollment>;
  getUserEnrollments(userId: string): Promise<Enrollment[]>;
  getCourseEnrollments(courseId: number): Promise<Enrollment[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationRead(id: number): Promise<void>;
  
  // Search operations
  searchTailors(query: string, filters?: any): Promise<TailorWithUser[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Tailor operations
  async createTailor(tailorData: InsertTailor): Promise<Tailor> {
    const [tailor] = await db.insert(tailors).values(tailorData).returning();
    return tailor;
  }

  async getTailor(id: number): Promise<TailorWithUser | undefined> {
    const [result] = await db
      .select()
      .from(tailors)
      .leftJoin(users, eq(tailors.userId, users.id))
      .where(eq(tailors.id, id));
    
    if (!result) return undefined;
    
    return {
      ...result.tailors,
      user: result.users!,
    };
  }

  async getTailorByUserId(userId: string): Promise<TailorWithUser | undefined> {
    const [result] = await db
      .select()
      .from(tailors)
      .leftJoin(users, eq(tailors.userId, users.id))
      .where(eq(tailors.userId, userId));
    
    if (!result) return undefined;
    
    return {
      ...result.tailors,
      user: result.users!,
    };
  }

  async getTailorsNearby(lat: number, lng: number, radius: number): Promise<TailorWithUser[]> {
    // Using Haversine formula for distance calculation
    const results = await db
      .select()
      .from(tailors)
      .leftJoin(users, eq(tailors.userId, users.id))
      .where(
        and(
          eq(tailors.isVerified, true),
          sql`(
            6371 * acos(
              cos(radians(${lat})) * 
              cos(radians(${users.latitude})) * 
              cos(radians(${users.longitude}) - radians(${lng})) + 
              sin(radians(${lat})) * 
              sin(radians(${users.latitude}))
            )
          ) <= ${radius}`
        )
      )
      .orderBy(desc(tailors.averageRating));

    return results.map(result => ({
      ...result.tailors,
      user: result.users!,
    }));
  }

  async updateTailor(id: number, updates: Partial<InsertTailor>): Promise<Tailor | undefined> {
    const [tailor] = await db
      .update(tailors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(tailors.id, id))
      .returning();
    return tailor;
  }

  async updateTailorRating(tailorId: number): Promise<void> {
    const [result] = await db
      .select({
        avgRating: sql<number>`AVG(${reviews.rating})`,
        totalReviews: sql<number>`COUNT(${reviews.id})`,
      })
      .from(reviews)
      .where(eq(reviews.tailorId, tailorId));

    if (result) {
      await db
        .update(tailors)
        .set({
          averageRating: result.avgRating?.toString() || "0",
          totalReviews: result.totalReviews || 0,
          updatedAt: new Date(),
        })
        .where(eq(tailors.id, tailorId));
    }
  }

  // Order operations
  async createOrder(orderData: InsertOrder): Promise<Order> {
    const orderNumber = `BC${Date.now()}`;
    const [order] = await db
      .insert(orders)
      .values({ ...orderData, orderNumber })
      .returning();
    return order;
  }

  async getOrder(id: number): Promise<OrderWithDetails | undefined> {
    const [result] = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .leftJoin(tailors, eq(orders.tailorId, tailors.id))
      .leftJoin(reviews, eq(orders.id, reviews.orderId))
      .where(eq(orders.id, id));

    if (!result) return undefined;

    return {
      ...result.orders,
      customer: result.users!,
      tailor: {
        ...result.tailors!,
        user: result.users!,
      },
      review: result.reviews || undefined,
    };
  }

  async getUserOrders(userId: string): Promise<OrderWithDetails[]> {
    const results = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .leftJoin(tailors, eq(orders.tailorId, tailors.id))
      .leftJoin(reviews, eq(orders.id, reviews.orderId))
      .where(eq(orders.customerId, userId))
      .orderBy(desc(orders.createdAt));

    return results.map(result => ({
      ...result.orders,
      customer: result.users!,
      tailor: {
        ...result.tailors!,
        user: result.users!,
      },
      review: result.reviews || undefined,
    }));
  }

  async getTailorOrders(tailorId: number): Promise<OrderWithDetails[]> {
    const results = await db
      .select()
      .from(orders)
      .leftJoin(users, eq(orders.customerId, users.id))
      .leftJoin(tailors, eq(orders.tailorId, tailors.id))
      .leftJoin(reviews, eq(orders.id, reviews.orderId))
      .where(eq(orders.tailorId, tailorId))
      .orderBy(desc(orders.createdAt));

    return results.map(result => ({
      ...result.orders,
      customer: result.users!,
      tailor: {
        ...result.tailors!,
        user: result.users!,
      },
      review: result.reviews || undefined,
    }));
  }

  async updateOrderStatus(id: number, status: string, progress?: number): Promise<Order | undefined> {
    const updateData: any = { status, updatedAt: new Date() };
    if (progress !== undefined) {
      updateData.progress = progress;
    }
    
    const [order] = await db
      .update(orders)
      .set(updateData)
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async updateOrderPrice(id: number, price: number): Promise<Order | undefined> {
    const [order] = await db
      .update(orders)
      .set({ finalPrice: price.toString(), updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  // Review operations
  async createReview(reviewData: InsertReview): Promise<Review> {
    const [review] = await db.insert(reviews).values(reviewData).returning();
    
    // Update tailor rating
    await this.updateTailorRating(reviewData.tailorId);
    
    return review;
  }

  async getTailorReviews(tailorId: number): Promise<ReviewWithDetails[]> {
    const results = await db
      .select()
      .from(reviews)
      .leftJoin(users, eq(reviews.customerId, users.id))
      .leftJoin(tailors, eq(reviews.tailorId, tailors.id))
      .leftJoin(orders, eq(reviews.orderId, orders.id))
      .where(eq(reviews.tailorId, tailorId))
      .orderBy(desc(reviews.createdAt));

    return results.map(result => ({
      ...result.reviews,
      customer: result.users!,
      tailor: {
        ...result.tailors!,
        user: result.users!,
      },
      order: result.orders!,
    }));
  }

  async getOrderReview(orderId: number): Promise<Review | undefined> {
    const [review] = await db
      .select()
      .from(reviews)
      .where(eq(reviews.orderId, orderId));
    return review;
  }

  // Course operations
  async createCourse(courseData: InsertCourse): Promise<Course> {
    const [course] = await db.insert(courses).values(courseData).returning();
    return course;
  }

  async getCourse(id: number): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course;
  }

  async getCourses(): Promise<Course[]> {
    return await db
      .select()
      .from(courses)
      .where(eq(courses.isActive, true))
      .orderBy(desc(courses.rating), desc(courses.createdAt));
  }

  async updateCourse(id: number, updates: Partial<InsertCourse>): Promise<Course | undefined> {
    const [course] = await db
      .update(courses)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(courses.id, id))
      .returning();
    return course;
  }

  // Enrollment operations
  async createEnrollment(enrollmentData: InsertEnrollment): Promise<Enrollment> {
    const [enrollment] = await db.insert(enrollments).values(enrollmentData).returning();
    
    // Update course enrollment count
    await db
      .update(courses)
      .set({
        totalEnrollments: sql`${courses.totalEnrollments} + 1`,
      })
      .where(eq(courses.id, enrollmentData.courseId));
    
    return enrollment;
  }

  async getUserEnrollments(userId: string): Promise<Enrollment[]> {
    return await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.createdAt));
  }

  async getCourseEnrollments(courseId: number): Promise<Enrollment[]> {
    return await db
      .select()
      .from(enrollments)
      .where(eq(enrollments.courseId, courseId))
      .orderBy(desc(enrollments.createdAt));
  }

  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const [notification] = await db.insert(notifications).values(notificationData).returning();
    return notification;
  }

  async getUserNotifications(userId: string): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt));
  }

  async markNotificationRead(id: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
  }

  // Search operations
  async searchTailors(query: string, filters?: any): Promise<TailorWithUser[]> {
    let whereConditions = eq(tailors.isVerified, true);
    
    if (query) {
      whereConditions = and(
        whereConditions,
        sql`(
          ${tailors.businessName} ILIKE ${`%${query}%`} OR
          ${tailors.bio} ILIKE ${`%${query}%`} OR
          ${users.firstName} ILIKE ${`%${query}%`} OR
          ${users.lastName} ILIKE ${`%${query}%`}
        )`
      );
    }

    const results = await db
      .select()
      .from(tailors)
      .leftJoin(users, eq(tailors.userId, users.id))
      .where(whereConditions)
      .orderBy(desc(tailors.averageRating));

    return results.map(result => ({
      ...result.tailors,
      user: result.users!,
    }));
  }
}

export const storage = new DatabaseStorage();
