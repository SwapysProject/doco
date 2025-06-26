export interface TestimonialData {
  id: number;
  name: string;
  title: string;
  specialty: string;
  image: string;
  review: string;
  rating: number;
}

export const testimonials: TestimonialData[] = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    title: "Chief Medical Officer",
    specialty: "Cardiology",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    review: "Doctor Care System has revolutionized our practice. The AI-powered prescription management has reduced errors by 90% and improved patient safety significantly.",
    rating: 5
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    title: "Senior Physician",
    specialty: "Internal Medicine",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face",
    review: "The comprehensive patient management features have streamlined our workflow. We can now handle 40% more patients while maintaining quality care.",
    rating: 5
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    title: "Medical Director",
    specialty: "Pediatrics",
    image: "https://images.unsplash.com/photo-1594824388853-e7d2b7d0d7e9?w=150&h=150&fit=crop&crop=face",
    review: "The intelligent appointment scheduling has eliminated double bookings completely. Our patients love the seamless experience and real-time updates.",
    rating: 5
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    title: "Department Head",
    specialty: "Emergency Medicine",
    image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face",
    review: "Real-time analytics and insights have transformed our decision-making process. We can now identify trends and optimize care delivery like never before.",
    rating: 5
  },
  {
    id: 5,
    name: "Dr. Lisa Thompson",
    title: "Practice Owner",
    specialty: "Family Medicine",
    image: "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?w=150&h=150&fit=crop&crop=face",
    review: "The enterprise-grade security and HIPAA compliance give us complete peace of mind. Our patients trust us with their sensitive medical data.",
    rating: 4
  }
];
