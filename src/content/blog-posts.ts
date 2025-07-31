export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  publishedAt: string;
  author: string;
  tags: string[];
  featuredImage?: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "top-5-ai-script-generators-2025",
    title: "Top 5 AI Script Generators in 2025 (Compared)",
    description: "Discover the best AI script generators for 2025. Compare features, pricing, and performance of leading tools including ReadyScriptPro.",
    content: "Comprehensive comparison of the top AI script generators in 2025, including ReadyScriptPro, ScriptAI Pro, StoryFlow AI, QuickScript AI, and ScreenplayAI. Analysis of features, pricing, and use cases for different types of creators.",
    publishedAt: "2025-01-15",
    author: "ReadyScriptPro Team",
    tags: ["AI script generator", "script writing tools", "content creation", "filmmaking", "screenwriting"],
    featuredImage: "/images/blog/ai-script-generators-2025.jpg"
  },
  {
    slug: "how-to-use-ai-script-generator-save-time",
    title: "How to Use an AI Script Generator to Save 10+ Hours of Writing Time",
    description: "Learn how to leverage AI script generators to dramatically reduce your writing time while maintaining quality. Step-by-step guide with practical tips.",
    content: "Detailed guide on maximizing AI script generator efficiency. Covers prompt engineering, iterative generation, quality control, and best practices for saving 10+ hours per script while maintaining professional quality.",
    publishedAt: "2025-01-10",
    author: "ReadyScriptPro Team",
    tags: ["AI script generator", "content creation", "productivity", "writing tips", "time management"],
    featuredImage: "/images/blog/ai-script-time-saving.jpg"
  },
  {
    slug: "ai-revolutionizing-short-film-scriptwriting",
    title: "How AI is Revolutionizing Short Film Scriptwriting",
    description: "Explore how AI technology is transforming the short film industry, making scriptwriting more accessible and efficient for indie filmmakers.",
    content: "Analysis of AI's impact on short film scriptwriting, including benefits for student filmmakers, indie creators, and festival submissions. Covers accelerated development, professional quality standards, and accessibility improvements.",
    publishedAt: "2025-01-08",
    author: "ReadyScriptPro Team",
    tags: ["AI short film script generator", "short film scripts", "filmmaking", "screenwriting", "indie film"],
    featuredImage: "/images/blog/ai-short-film-revolution.jpg"
  },
  {
    slug: "best-practices-generating-short-film-scripts-ai",
    title: "Best Practices for Generating Short Film Scripts with AI",
    description: "Master the art of creating compelling short film scripts using AI tools. Learn proven techniques for maximizing quality and efficiency.",
    content: "Comprehensive guide to creating high-quality short film scripts with AI. Covers prompt engineering, quality control, genre-specific strategies, and production considerations for filmmakers.",
    publishedAt: "2025-01-05",
    author: "ReadyScriptPro Team",
    tags: ["short film scripts", "AI script generation", "filmmaking", "screenwriting tips", "film production"],
    featuredImage: "/images/blog/short-film-script-best-practices.jpg"
  },
  {
    slug: "how-write-youtube-video-scripts-ai-templates",
    title: "How to Write YouTube Video Scripts Using AI (With Templates)",
    description: "Master YouTube script writing with AI tools. Learn proven templates and techniques for creating engaging video content that drives views and engagement.",
    content: "Complete guide to YouTube script writing with AI, including proven templates for educational, entertainment, and review videos. Covers SEO optimization, engagement strategies, and quality control.",
    publishedAt: "2025-01-03",
    author: "ReadyScriptPro Team",
    tags: ["video script generator", "YouTube scripts", "content creation", "AI writing", "video marketing"],
    featuredImage: "/images/blog/youtube-script-ai-templates.jpg"
  }
];

export default blogPosts; 