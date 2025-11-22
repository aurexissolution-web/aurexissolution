
import type { Service, Project, Testimonial, SiteContent, Invoice, Quotation, Founder } from '../types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: '1',
    icon: 'Cloud',
    title: 'Cloud Solutions',
    description: 'Scalable and secure cloud infrastructure to power your business growth. We specialize in AWS, Azure, and Google Cloud platforms.',
    detailedDescription: [
      'In today\'s fast-paced digital environment, a flexible and robust cloud infrastructure is no longer a luxury—it\'s a necessity. Our Cloud Solutions are designed to provide your business with the scalability, security, and performance required to stay competitive.',
      'We partner with leading cloud providers like Amazon Web Services (AWS), Microsoft Azure, and Google Cloud Platform (GCP) to architect, deploy, and manage bespoke cloud environments. Whether you\'re migrating existing applications, building cloud-native solutions, or optimizing your current setup for cost and performance, our certified experts are here to guide you every step of the way.'
    ],
    keyFeatures: ['Scalable Infrastructure', 'High Availability & Disaster Recovery', 'Cost Optimization', 'Managed Security & Compliance'],
    technologies: ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Terraform']
  },
  {
    id: '2',
    icon: 'Shield',
    title: 'Cybersecurity',
    description: 'Protect your digital assets with our comprehensive cybersecurity services, including threat analysis, penetration testing, and 24/7 monitoring.',
    detailedDescription: [
      'As digital threats become more sophisticated, proactive and comprehensive cybersecurity is paramount. Our multi-layered security approach protects your critical data, infrastructure, and applications from the inside out.',
      'We offer a full suite of services, from initial vulnerability assessments and penetration testing to continuous 24/7 security monitoring and incident response. Our security experts work as an extension of your team to identify risks, implement robust defenses, and ensure you meet industry and regulatory compliance standards.'
    ],
    keyFeatures: ['Threat Intelligence & Analysis', 'Vulnerability Assessment & Pen Testing', '24/7 Security Operations Center (SOC)', 'Compliance & Governance Management'],
    technologies: ['SIEM', 'Next-Gen Firewalls (NGFW)', 'Endpoint Detection & Response (EDR)', 'Intrusion Prevention Systems (IPS)']
  },
  {
    id: '3',
    icon: 'Code',
    title: 'Custom Software Dev',
    description: 'Bespoke software solutions tailored to your unique business needs, from web applications to enterprise-level systems.',
    detailedDescription: [
      'Off-the-shelf software can only take your business so far. We specialize in creating custom software solutions that are meticulously designed and engineered to solve your unique challenges and streamline your specific workflows.',
      'Our development process is collaborative and agile, ensuring the final product is not only powerful and scalable but also intuitive and perfectly aligned with your business objectives. From enterprise resource planning (ERP) systems to customer-facing web and mobile applications, we build solutions that provide a true competitive advantage.'
    ],
    keyFeatures: ['Agile Development Methodology', 'Human-Centered UI/UX Design', 'Scalable & Secure Architecture', 'API Development & Integration', 'Ongoing Maintenance & Support'],
    technologies: ['React', 'Node.js', 'Python', 'Java', 'PostgreSQL', 'GraphQL']
  },
  {
    id: '4',
    icon: 'Database',
    title: 'Data & Analytics',
    description: 'Turn your data into actionable insights with our advanced analytics, machine learning, and business intelligence services.',
    detailedDescription: [
      'Data is one of your most valuable assets, but only if you can harness its power. Our Data & Analytics services help you transform raw data into clear, actionable insights that drive strategic decision-making.',
      'We design and implement end-to-end data solutions, including data warehousing, ETL pipelines, and business intelligence dashboards. Our data scientists also leverage advanced techniques like machine learning and predictive modeling to uncover hidden patterns and forecast future trends, giving you the foresight to capitalize on new opportunities.'
    ],
    keyFeatures: ['Business Intelligence Dashboards', 'Predictive Modeling & Machine Learning', 'Data Warehousing & ETL', 'Data Governance & Quality Management'],
    technologies: ['Tableau', 'Power BI', 'Python (Pandas, Scikit-learn)', 'Apache Spark', 'SQL', 'Snowflake']
  },
  {
    id: '5',
    icon: 'Smartphone',
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile applications that deliver exceptional user experiences across iOS and Android devices.',
    detailedDescription: [
      'Mobile applications are essential for modern business success. We create powerful, intuitive mobile apps that engage your customers and streamline your operations.',
      'Our mobile development expertise spans both native iOS and Android development, as well as cross-platform solutions using React Native and Flutter. We focus on performance, security, and user experience to deliver apps that your users will love.'
    ],
    keyFeatures: ['Native iOS & Android Development', 'Cross-Platform Solutions', 'UI/UX Design', 'App Store Optimization', 'Performance Optimization'],
    technologies: ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase', 'App Store Connect']
  },
  {
    id: '6',
    icon: 'Globe',
    title: 'Web Development',
    description: 'Modern, responsive websites and web applications built with cutting-edge technologies for optimal performance and user experience.',
    detailedDescription: [
      'Your website is often the first impression customers have of your business. We create stunning, fast, and responsive websites that convert visitors into customers.',
      'From simple brochure sites to complex web applications, we use modern frameworks and best practices to ensure your web presence is both beautiful and functional. Our websites are optimized for search engines, mobile devices, and accessibility.'
    ],
    keyFeatures: ['Responsive Design', 'SEO Optimization', 'Performance Optimization', 'Content Management Systems', 'E-commerce Solutions'],
    technologies: ['React', 'Next.js', 'Vue.js', 'WordPress', 'Shopify', 'Webflow']
  },
  {
    id: '7',
    icon: 'Users',
    title: 'IT Consulting',
    description: 'Strategic IT guidance to help you make informed technology decisions and optimize your digital infrastructure for maximum efficiency.',
    detailedDescription: [
      'Technology decisions can make or break your business. Our IT consulting services provide the strategic guidance you need to navigate complex technology choices.',
      'We analyze your current technology stack, identify opportunities for improvement, and develop comprehensive roadmaps for digital transformation. Our consultants work closely with your team to ensure technology investments align with your business goals.'
    ],
    keyFeatures: ['Technology Assessment', 'Digital Transformation Planning', 'Vendor Selection', 'IT Strategy Development', 'Change Management'],
    technologies: ['Enterprise Architecture', 'ITIL', 'Agile Methodologies', 'Project Management', 'Risk Assessment']
  },
  {
    id: '8',
    icon: 'Headphones',
    title: 'IT Support & Maintenance',
    description: 'Comprehensive IT support services to keep your systems running smoothly with 24/7 monitoring and rapid response times.',
    detailedDescription: [
      'Downtime costs money. Our IT support and maintenance services ensure your systems are always running at peak performance.',
      'We provide proactive monitoring, preventive maintenance, and rapid incident response to minimize downtime and maximize productivity. Our support team is available around the clock to address any technical issues that arise.'
    ],
    keyFeatures: ['24/7 Monitoring', 'Proactive Maintenance', 'Rapid Incident Response', 'Remote Support', 'On-site Support'],
    technologies: ['Remote Monitoring Tools', 'Ticketing Systems', 'Backup Solutions', 'Patch Management', 'Performance Monitoring']
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Enterprise CRM Platform',
    description: 'A comprehensive CRM platform for a major financial institution, improving customer relations and streamlining sales pipelines.',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-01-15',
    createdAt: new Date(),
    createdBy: 'admin',
    assignedTo: 'customer1',
    assignedType: 'customer',
    budget: 50000,
    paymentStatus: 'paid',
    notes: 'Successfully delivered on time with excellent feedback from the client.'
  },
  {
    id: '2',
    title: 'E-commerce Cloud Migration',
    description: 'Migrated a high-traffic e-commerce site to a scalable AWS infrastructure, resulting in 99.99% uptime and faster load times.',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2024-02-28',
    createdAt: new Date(),
    createdBy: 'admin',
    assignedTo: 'employee1',
    assignedType: 'employee',
    budget: 30000,
    paymentStatus: 'pending',
    notes: 'Migration is 70% complete. All major components have been migrated successfully.'
  },
  {
    id: '3',
    title: 'Healthcare Data Analytics',
    description: 'Developed a predictive analytics model for a healthcare provider to forecast patient admission rates and optimize resource allocation.',
    status: 'pending',
    priority: 'high',
    dueDate: '2024-03-15',
    createdAt: new Date(),
    createdBy: 'admin',
    assignedTo: 'customer2',
    assignedType: 'customer',
    budget: 75000,
    paymentStatus: 'pending',
    notes: 'Project kickoff scheduled for next week. Initial requirements gathering completed.'
  },
  // Portfolio Items (shown on public website)
  {
    id: 'portfolio-1',
    title: 'E-Commerce Platform Redesign',
    description: 'Complete redesign and development of a modern e-commerce platform with advanced features including real-time inventory, payment integration, and AI-powered recommendations.',
    category: 'Web Development',
    imageData: 'https://images.unsplash.com/photo-1661956602116-aa6865609028?w=800&q=80',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-01-15',
    createdAt: new Date(),
    createdBy: 'admin',
    assignedTo: 'admin',
    assignedType: 'employee',
    isPortfolioItem: true,
    liveUrl: 'https://example.com',
    githubUrl: 'https://github.com'
  },
  {
    id: 'portfolio-2',
    title: 'Cloud Infrastructure Migration',
    description: 'Migrated enterprise applications to AWS cloud infrastructure with 99.99% uptime, auto-scaling, and disaster recovery implementation.',
    category: 'Cloud Solutions',
    imageData: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-02-20',
    createdAt: new Date(),
    createdBy: 'admin',
    assignedTo: 'admin',
    assignedType: 'employee',
    isPortfolioItem: true
  },
  {
    id: 'portfolio-3',
    title: 'Mobile Banking Application',
    description: 'Cross-platform mobile banking app with biometric authentication, real-time transactions, and comprehensive security features for iOS and Android.',
    category: 'Mobile Development',
    imageData: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-03-10',
    createdAt: new Date(),
    createdBy: 'admin',
    assignedTo: 'admin',
    assignedType: 'employee',
    isPortfolioItem: true,
    liveUrl: 'https://example.com/app'
  },
  {
    id: 'portfolio-4',
    title: 'Data Analytics Dashboard',
    description: 'Real-time business intelligence dashboard with predictive analytics, data visualization, and automated reporting for enterprise decision-making.',
    category: 'Data & Analytics',
    imageData: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    status: 'completed',
    priority: 'medium',
    dueDate: '2024-04-05',
    createdAt: new Date(),
    createdBy: 'admin',
    assignedTo: 'admin',
    assignedType: 'employee',
    isPortfolioItem: true
  },
  {
    id: 'portfolio-5',
    title: 'Cybersecurity Audit Platform',
    description: 'Comprehensive security audit and monitoring platform with threat detection, vulnerability assessment, and compliance reporting.',
    category: 'Cybersecurity',
    imageData: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-05-15',
    createdAt: new Date(),
    createdBy: 'admin',
    assignedTo: 'admin',
    assignedType: 'employee',
    isPortfolioItem: true
  },
  {
    id: 'portfolio-6',
    title: 'Custom ERP System',
    description: 'Enterprise Resource Planning system tailored for manufacturing industry with inventory management, production planning, and supply chain optimization.',
    category: 'Software Development',
    imageData: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    status: 'completed',
    priority: 'high',
    dueDate: '2024-06-20',
    createdAt: new Date(),
    createdBy: 'admin',
    assignedTo: 'admin',
    assignedType: 'employee',
    isPortfolioItem: true,
    githubUrl: 'https://github.com'
  }
];

export const INITIAL_TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    quote: "Aurexis Solution transformed our operations. Their cloud solution is robust, scalable, and has significantly reduced our IT overhead. A true partner in innovation.",
    author: 'Jane Doe',
    company: 'CEO, Innovate Inc.'
  },
  {
    id: '2',
    quote: "The custom software they developed for us was a game-changer. It's intuitive, powerful, and perfectly aligned with our workflow. The team was exceptional.",
    author: 'John Smith',
    company: 'COO, Global Logistics'
  },
  {
    id: '3',
    quote: "Their cybersecurity services gave us peace of mind. The 24/7 monitoring and rapid response team have protected us from multiple threats. Highly recommended!",
    author: 'Sarah Johnson',
    company: 'CTO, TechStart Solutions'
  },
  {
    id: '4',
    quote: "The mobile app they built for us exceeded all expectations. User engagement increased by 300% and customer satisfaction is at an all-time high.",
    author: 'Michael Chen',
    company: 'Founder, RetailMax'
  },
  {
    id: '5',
    quote: "Aurexis's data analytics services helped us uncover insights we never knew existed. Our decision-making process is now data-driven and incredibly effective.",
    author: 'Dr. Emily Rodriguez',
    company: 'Director, Healthcare Analytics Corp'
  },
  {
    id: '6',
    quote: "Their IT consulting saved us from making costly mistakes. The strategic guidance and technology roadmap they provided was invaluable for our digital transformation.",
    author: 'Robert Kim',
    company: 'VP Technology, Manufacturing Plus'
  }
];

export const INITIAL_SITE_CONTENT: SiteContent = {
  heroTitle: 'Innovative IT Solutions for a Digital World',
  heroSubtitle: 'Aurexis Solution delivers cutting-edge technology services that drive business growth and efficiency. Partner with us to unlock your potential.',
  aboutTitle: 'About Aurexis Solution',
  aboutText: 'Founded on the principle of innovation, Aurexis Solution is a premier IT services provider dedicated to helping businesses navigate the complexities of the digital landscape. Our team of certified experts is committed to delivering excellence and tailored solutions that yield tangible results. We believe in building long-term partnerships based on trust, transparency, and a shared vision for success.',
  logoUrl: '',
  socialMedia: {
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    tiktok: ''
  },
  contactInfo: {
    heading: 'Contact Information',
    description: "Fill up the form and our team will get back to you within 24 hours. Or, reach out to us directly through one of the channels below.",
    contacts: [
      {
        id: 'contact-1',
        name: 'Mr. Jay',
        role: 'Business Inquiries',
        phone: '+60 16-407 1129'
      },
      {
        id: 'contact-2',
        name: 'Mr. Shan',
        role: 'Partnerships & Operations',
        phone: '+60 11-7111 3184'
      }
    ],
    office: {
      label: 'Our Office',
      address: 'Amanjaya, Jalan Badlishah, Bandar Amanjaya, 08000 Sungai Petani, Kedah'
    }
  }
};

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-001',
    customerName: 'Innovate Inc.',
    customerAddress: '123 Tech Park, Silicon Valley, CA 94001',
    customerCode: 'CUST-001',
    customerContactPerson: 'Attn: Mr. John Doe\nTEL: 555-1234',
    invoiceDate: '2024-07-15',
    dueDate: '2024-08-14',
    creditTerm: '30 Days',
    items: [
      { id: 'item-1', itemCode: 'CS-MONTHLY', description: 'Cloud Solutions - Monthly Retainer', quantity: 1, unit: 'UNIT', price: 5000, discount: 0 },
      { id: 'item-2', itemCode: 'SEC-AUDIT', description: 'Cybersecurity Audit', quantity: 1, unit: 'UNIT', price: 2500, discount: 0 },
    ],
    status: 'Paid',
    sstRate: 6,
    deliveryDate: 'N/A',
    deliveryAddress: 'N/A',
    notes: 'Thank you for your business.',
    bankDetails: 'PUBLIC BANK BERHAD - 1234 5678 90'
  },
];

export const INITIAL_QUOTATIONS: Quotation[] = [
  {
    id: 'qt-1',
    quoteNumber: 'QT-2024-001',
    customerName: 'Future Gadgets Ltd.',
    customerAddress: '789 Innovation Ave, Boston, MA 02101',
    customerCode: 'CUST-002',
    customerContactPerson: 'Attn: Ms. Jane Smith\nTEL: 555-5678',
    quoteDate: '2024-07-10',
    expiryDate: '2024-08-09',
    creditTerm: 'COD',
    items: [
      { id: 'item-1', itemCode: 'DA-SETUP', description: 'Data & Analytics Dashboard Setup', quantity: 1, unit: 'SET', price: 8000, discount: 0 },
      { id: 'item-2', itemCode: 'TRAIN-01', description: 'Staff Training', quantity: 4, unit: 'SESSION', price: 500, discount: 10 },
    ],
    status: 'Accepted',
    sstRate: 0,
    deliveryDate: 'To be confirmed',
    deliveryAddress: '789 Innovation Ave, Boston, MA 02101',
    notes: 'Price are subjected to change without prior notice.',
    bankDetails: 'PUBLIC BANK BERHAD - 3088 1277 17'
  },
];


export const INITIAL_FOUNDERS: Omit<Founder, 'id'>[] = [
  {
    name: 'Sanjay Gunabalan',
    title: 'Co-Founder & CEO',
    handle: 'sanjayg',
    status: 'Driving Innovation',
    imageData: 'https://picsum.photos/seed/sanjay/400/600',
    bio: 'Sanjay is a visionary leader with a passion for driving technological innovation and business strategy. He co-founded Aurexis Solution to deliver exceptional IT services and empower businesses to thrive in the digital age.',
    linkedinUrl: 'https://www.linkedin.com/',
    twitterUrl: 'https://twitter.com/',
    githubUrl: '',
    profileUrl: 'https://www.linkedin.com/'
  },
  {
    name: 'Tharshann Rao',
    title: 'Founder & CTO',
    handle: 'tharshannr',
    status: 'Building the Future',
    imageData: 'https://picsum.photos/seed/tharshann/400/600',
    bio: 'Tharshann, the technical architect of Aurexis Solution, brings deep expertise in software engineering and cybersecurity. He is dedicated to building robust, scalable, and secure systems that solve complex challenges.',
    linkedinUrl: 'https://www.linkedin.com/',
    twitterUrl: '',
    githubUrl: 'https://github.com/',
    profileUrl: 'https://www.linkedin.com/'
  },
];