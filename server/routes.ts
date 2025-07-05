import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
//import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertTailorSchema, 
  insertOrderSchema, 
  insertReviewSchema, 
  insertCourseSchema,
  insertEnrollmentSchema,
  insertNotificationSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updateData = req.body;
      
      const user = await storage.upsertUser({
        id: userId,
        ...updateData,
      });
      
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Tailor routes
  app.post('/api/tailors', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tailorData = insertTailorSchema.parse({ ...req.body, userId });
      
      const tailor = await storage.createTailor(tailorData);
      
      // Update user role to tailor
      await storage.upsertUser({
        id: userId,
        role: 'tailor',
      });
      
      res.json(tailor);
    } catch (error) {
      console.error("Error creating tailor profile:", error);
      res.status(500).json({ message: "Failed to create tailor profile" });
    }
  });

  app.get('/api/tailors/nearby', async (req, res) => {
    try {
      const { lat, lng, radius = 10 } = req.query;
      
      if (!lat || !lng) {
        return res.status(400).json({ message: "Latitude and longitude are required" });
      }
      
      const tailors = await storage.getTailorsNearby(
        parseFloat(lat as string),
        parseFloat(lng as string),
        parseInt(radius as string)
      );
      
      res.json(tailors);
    } catch (error) {
      console.error("Error fetching nearby tailors:", error);
      res.status(500).json({ message: "Failed to fetch nearby tailors" });
    }
  });

  app.get('/api/tailors/search', async (req, res) => {
    try {
      const { q, ...filters } = req.query;
      const tailors = await storage.searchTailors(q as string || "", filters);
      res.json(tailors);
    } catch (error) {
      console.error("Error searching tailors:", error);
      res.status(500).json({ message: "Failed to search tailors" });
    }
  });

  app.get('/api/tailors/:id', async (req, res) => {
    try {
      const tailorId = parseInt(req.params.id);
      const tailor = await storage.getTailor(tailorId);
      
      if (!tailor) {
        return res.status(404).json({ message: "Tailor not found" });
      }
      
      res.json(tailor);
    } catch (error) {
      console.error("Error fetching tailor:", error);
      res.status(500).json({ message: "Failed to fetch tailor" });
    }
  });

  app.get('/api/tailors/:id/reviews', async (req, res) => {
    try {
      const tailorId = parseInt(req.params.id);
      const reviews = await storage.getTailorReviews(tailorId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.put('/api/tailors/:id', isAuthenticated, async (req: any, res) => {
    try {
      const tailorId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      // Verify ownership
      const existingTailor = await storage.getTailor(tailorId);
      if (!existingTailor || existingTailor.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updateData = req.body;
      const tailor = await storage.updateTailor(tailorId, updateData);
      res.json(tailor);
    } catch (error) {
      console.error("Error updating tailor:", error);
      res.status(500).json({ message: "Failed to update tailor" });
    }
  });

  // Order routes
  app.post('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user.claims.sub;
      const orderData = insertOrderSchema.parse({ ...req.body, customerId });
      
      const order = await storage.createOrder(orderData);
      
      // Create notification for tailor
      await storage.createNotification({
        userId: orderData.tailorId.toString(),
        title: "New Order Received",
        message: `You have received a new order for ${orderData.blouseType}`,
        type: "order_update",
        relatedId: order.id.toString(),
      });
      
      res.json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.get('/api/orders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.query;
      
      let orders;
      if (type === 'tailor') {
        const tailor = await storage.getTailorByUserId(userId);
        if (!tailor) {
          return res.status(404).json({ message: "Tailor profile not found" });
        }
        orders = await storage.getTailorOrders(tailor.id);
      } else {
        orders = await storage.getUserOrders(userId);
      }
      
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get('/api/orders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Check if user has access to this order
      const tailor = await storage.getTailorByUserId(userId);
      const hasAccess = order.customerId === userId || 
                       (tailor && order.tailorId === tailor.id);
      
      if (!hasAccess) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      res.json(order);
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.put('/api/orders/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { status, progress } = req.body;
      
      // Verify tailor ownership
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const tailor = await storage.getTailorByUserId(userId);
      if (!tailor || order.tailorId !== tailor.id) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      const updatedOrder = await storage.updateOrderStatus(orderId, status, progress);
      
      // Create notification for customer
      await storage.createNotification({
        userId: order.customerId,
        title: "Order Status Updated",
        message: `Your order status has been updated to: ${status}`,
        type: "order_update",
        relatedId: orderId.toString(),
      });
      
      res.json(updatedOrder);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Review routes
  app.post('/api/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const customerId = req.user.claims.sub;
      const reviewData = insertReviewSchema.parse({ ...req.body, customerId });
      
      // Verify order ownership and completion
      const order = await storage.getOrder(reviewData.orderId);
      if (!order || order.customerId !== customerId) {
        return res.status(403).json({ message: "Unauthorized" });
      }
      
      if (order.status !== 'delivered') {
        return res.status(400).json({ message: "Order must be delivered to leave a review" });
      }
      
      // Check if review already exists
      const existingReview = await storage.getOrderReview(reviewData.orderId);
      if (existingReview) {
        return res.status(400).json({ message: "Review already exists for this order" });
      }
      
      const review = await storage.createReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Course routes
  app.get('/api/courses', async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({ message: "Failed to fetch courses" });
    }
  });

  app.get('/api/courses/:id', async (req, res) => {
    try {
      const courseId = parseInt(req.params.id);
      const course = await storage.getCourse(courseId);
      
      if (!course) {
        return res.status(404).json({ message: "Course not found" });
      }
      
      res.json(course);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({ message: "Failed to fetch course" });
    }
  });

  app.post('/api/courses', isAuthenticated, async (req: any, res) => {
    try {
      const instructorId = req.user.claims.sub;
      const courseData = insertCourseSchema.parse({ ...req.body, instructorId });
      
      const course = await storage.createCourse(courseData);
      res.json(course);
    } catch (error) {
      console.error("Error creating course:", error);
      res.status(500).json({ message: "Failed to create course" });
    }
  });

  app.post('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollmentData = insertEnrollmentSchema.parse({ ...req.body, userId });
      
      const enrollment = await storage.createEnrollment(enrollmentData);
      res.json(enrollment);
    } catch (error) {
      console.error("Error creating enrollment:", error);
      res.status(500).json({ message: "Failed to enroll in course" });
    }
  });

  app.get('/api/enrollments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const enrollments = await storage.getUserEnrollments(userId);
      res.json(enrollments);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
      res.status(500).json({ message: "Failed to fetch enrollments" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const notifications = await storage.getUserNotifications(userId);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.put('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Admin routes
  app.get('/api/admin/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (user?.role !== 'admin') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      // TODO: Implement admin statistics
      res.json({
        totalUsers: 0,
        totalTailors: 0,
        totalOrders: 0,
        totalRevenue: 0,
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Failed to fetch admin stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
