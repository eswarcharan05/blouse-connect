import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, Clock, Users, Star, Award, BookOpen, 
  Video, Calendar, ChevronRight, Download 
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";
import type { Course, Enrollment } from "@shared/schema";

export default function Learning() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Fetch available courses
  const { data: courses = [], isLoading: loadingCourses } = useQuery<Course[]>({
    queryKey: ['/api/courses'],
  });

  // Fetch user enrollments
  const { data: enrollments = [], isLoading: loadingEnrollments } = useQuery<Enrollment[]>({
    queryKey: ['/api/enrollments'],
  });

  // Enroll in course mutation
  const enrollMutation = useMutation({
    mutationFn: async (courseId: number) => {
      const response = await apiRequest('POST', '/api/enrollments', { courseId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Enrollment Successful!",
        description: "You have been enrolled in the course.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/enrollments'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const featuredCourses = courses.filter(course => course.rating >= 4.5).slice(0, 3);
  const enrolledCourseIds = enrollments.map(e => e.courseId);

  const formatDuration = (hours: number) => {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-golden-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  const CourseCard = ({ course, featured = false }: { course: Course; featured?: boolean }) => {
    const isEnrolled = enrolledCourseIds.includes(course.id);

    return (
      <Card className={`cultural-shadow hover:shadow-lg transition-shadow ${featured ? 'border-golden-400' : ''}`}>
        <CardContent className="p-6">
          {featured && (
            <Badge className="bg-golden-500 text-white mb-3">
              Featured Course
            </Badge>
          )}
          
          <div className="relative mb-4">
            <img 
              src={course.thumbnailUrl || "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=250"}
              alt={course.title}
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <Button size="sm" variant="secondary">
                <Play size={16} className="mr-1" />
                Preview
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">{course.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Clock size={14} />
                <span>{formatDuration(course.duration || 0)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users size={14} />
                <span>{course.totalEnrollments} students</span>
              </div>
              <div className="flex items-center space-x-1">
                <Badge variant="outline" className="text-xs">
                  {course.level}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex">
                {renderStars(parseFloat(course.rating || '0'))}
              </div>
              <span className="text-sm text-gray-600">
                {course.rating} ({course.totalEnrollments} students)
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold text-emerald-600">₹{course.price}</span>
                {course.originalPrice && (
                  <span className="text-gray-500 line-through ml-2">₹{course.originalPrice}</span>
                )}
              </div>
              
              {isEnrolled ? (
                <Badge className="bg-emerald-600">
                  <Award size={12} className="mr-1" />
                  Enrolled
                </Badge>
              ) : (
                <Button 
                  size="sm"
                  onClick={() => enrollMutation.mutate(course.id)}
                  disabled={enrollMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  Enroll Now
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EnrollmentCard = ({ enrollment }: { enrollment: Enrollment }) => {
    const course = courses.find(c => c.id === enrollment.courseId);
    if (!course) return null;

    return (
      <Card className="cultural-shadow">
        <CardContent className="p-6">
          <div className="flex items-start space-x-4">
            <img 
              src={course.thumbnailUrl || "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
              alt={course.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
            
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1">{course.title}</h4>
              <p className="text-sm text-gray-600 mb-3">
                {course.level} • {formatDuration(course.duration || 0)}
              </p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium">{enrollment.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${enrollment.progress}%` }}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2 mt-4">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Play size={14} className="mr-1" />
                  Continue
                </Button>
                {enrollment.completedAt && (
                  <Button size="sm" variant="outline">
                    <Download size={14} className="mr-1" />
                    Certificate
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-cream-50 pb-20 lg:pb-0">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-emerald-50 to-royal-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-800 font-serif mb-4">
              Learn Blouse Stitching
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Master the art of blouse making with our expert-led workshops and online courses
            </p>
          </div>

          {/* Featured Course Banner */}
          {featuredCourses.length > 0 && (
            <Card className="cultural-shadow border-golden-400 border-2">
              <CardContent className="p-8">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div>
                    <Badge className="bg-golden-500 text-white mb-4">
                      Featured Course
                    </Badge>
                    <h2 className="text-2xl font-bold text-gray-800 mb-3 font-serif">
                      {featuredCourses[0].title}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {featuredCourses[0].description}
                    </p>
                    
                    <div className="space-y-2 text-sm text-gray-600 mb-6">
                      <div className="flex items-center space-x-2">
                        <Clock className="text-emerald-600" size={16} />
                        <span>{formatDuration(featuredCourses[0].duration || 0)} of video content</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="text-emerald-600" size={16} />
                        <span>{featuredCourses[0].totalEnrollments} students enrolled</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="text-emerald-600" size={16} />
                        <span>Certificate of completion</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-bold text-emerald-600">₹{featuredCourses[0].price}</span>
                        {featuredCourses[0].originalPrice && (
                          <span className="text-gray-500 line-through ml-2">₹{featuredCourses[0].originalPrice}</span>
                        )}
                      </div>
                      <Button 
                        size="lg"
                        onClick={() => enrollMutation.mutate(featuredCourses[0].id)}
                        disabled={enrollMutation.isPending || enrolledCourseIds.includes(featuredCourses[0].id)}
                        className="bg-emerald-600 hover:bg-emerald-700"
                      >
                        {enrolledCourseIds.includes(featuredCourses[0].id) ? 'Enrolled' : 'Enroll Now'}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <img 
                      src="https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
                      alt="Blouse making workshop"
                      className="rounded-xl shadow-lg w-full h-auto"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl flex items-center justify-center">
                      <Button size="lg" variant="secondary">
                        <Play size={24} className="mr-2" />
                        Watch Preview
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="all-courses" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="all-courses">All Courses</TabsTrigger>
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="live-workshops">Live Workshops</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all-courses" className="mt-8">
            {loadingCourses ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">{t('common.loading')}</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="my-courses" className="mt-8">
            {loadingEnrollments ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">{t('common.loading')}</p>
              </div>
            ) : enrollments.length === 0 ? (
              <Card className="cultural-shadow">
                <CardContent className="p-12 text-center">
                  <BookOpen className="mx-auto text-gray-400 mb-4" size={64} />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">No courses enrolled</h3>
                  <p className="text-gray-600 mb-6">
                    Start learning by enrolling in your first course
                  </p>
                  <Button 
                    onClick={() => document.querySelector('[data-state="active"][value="all-courses"]')?.click()}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Browse Courses
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {enrollments.map((enrollment) => (
                  <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="live-workshops" className="mt-8">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="cultural-shadow border-dashed border-2 border-golden-400">
                <CardContent className="p-8 text-center">
                  <Calendar className="mx-auto text-golden-500 mb-4" size={48} />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Live Workshop This Weekend</h3>
                  <p className="text-gray-600 mb-4">
                    Advanced Embroidery Techniques with Master Craftsperson
                  </p>
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Calendar size={14} />
                      <span>Saturday, Dec 16 • 10:00 AM - 4:00 PM</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Video size={14} />
                      <span>Live interactive session with Q&A</span>
                    </div>
                  </div>
                  <Button className="bg-golden-500 hover:bg-golden-600">
                    Register Now - ₹1,999
                  </Button>
                </CardContent>
              </Card>

              <Card className="cultural-shadow">
                <CardContent className="p-8 text-center">
                  <Video className="mx-auto text-royal-600 mb-4" size={48} />
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Monthly Masterclass</h3>
                  <p className="text-gray-600 mb-4">
                    Traditional Designs & Cultural Significance
                  </p>
                  <div className="space-y-2 text-sm text-gray-600 mb-6">
                    <div className="flex items-center justify-center space-x-2">
                      <Calendar size={14} />
                      <span>Last Saturday of every month</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <Users size={14} />
                      <span>Small group sessions (max 20)</span>
                    </div>
                  </div>
                  <Button variant="outline" className="border-royal-600 text-royal-600">
                    Learn More
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
