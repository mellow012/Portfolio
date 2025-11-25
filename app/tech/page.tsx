'use client'

import { motion } from 'framer-motion'
import { Code, Database, Globe, Smartphone, Cloud, Palette, FileCode, Layout, Layers, Zap, Server, Terminal, Coffee, HardDrive, Archive, Github, Upload, Figma, Paintbrush, Image, Monitor, Brain, TrendingUp, Cpu, Lock, ArrowRight, Mail } from 'lucide-react'

const techCategories = [
  {
    title: 'Frontend Development',
    icon: Globe,
    technologies: [
      { name: 'Next.js', level: 95, color: 'bg-blue-500', icon: FileCode, description: 'Modern React framework for SSR and static sites.' },
      { name: 'React', level: 90, color: 'bg-cyan-500', icon: Layers, description: 'Component-based UI library for dynamic interfaces.' },
      { name: 'TypeScript', level: 85, color: 'bg-blue-600', icon: Code, description: 'Typed JavaScript for robust, scalable apps.' },
      { name: 'Tailwind CSS', level: 90, color: 'bg-teal-500', icon: Palette, description: 'Utility-first CSS for rapid, responsive design.' },
      { name: 'CSS', level: 80, color: 'bg-purple-500', icon: Layout, description: 'Core styling for web layouts.' },
      { name: 'HTML', level: 95, color: 'bg-orange-500', icon: Globe, description: 'Foundation of web structure.' },
      { name: 'JavaScript', level: 90, color: 'bg-yellow-500', icon: Coffee, description: 'Dynamic scripting for interactive web apps.' }
    ],
  },
  {
    title: 'Mobile Development',
    icon: Smartphone,
    technologies: [
      { name: 'Jetpack Compose', level: 85, color: 'bg-green-600', icon: Zap, description: 'Modern Android UI toolkit.' },
      { name: 'Kotlin', level: 80, color: 'bg-purple-500', icon: Code, description: 'Concise language for Android development.' },
      { name: 'React Native', level: 75, color: 'bg-blue-400', icon: Smartphone, description: 'Cross-platform mobile app development.' },
    ],
  },
  {
    title: 'Backend Development',
    icon: Code,
    technologies: [
      { name: 'Node.js', level: 85, color: 'bg-green-500', icon: Server, description: 'JavaScript runtime for scalable APIs.' },
      { name: 'Python', level: 80, color: 'bg-yellow-500', icon: Terminal, description: 'Versatile language for backend and scripting.' },
      { name: 'Java', level: 75, color: 'bg-orange-500', icon: Coffee, description: 'Robust language for enterprise apps.' },
      { name: 'Express.js', level: 65, color: 'bg-gray-600', icon: Server, description: 'Lightweight Node.js framework for APIs.' },
      { name: 'Django', level: 50, color: 'bg-green-700', icon: Code, description: 'Python framework for rapid development.' },
    ],
  },
  {
    title: 'Database & Storage',
    icon: Database,
    technologies: [
      { name: 'Firebase', level: 90, color: 'bg-orange-500', icon: Database, description: 'NoSQL database and backend services.' },
      { name: 'Firestore', level: 85, color: 'bg-orange-400', icon: HardDrive, description: 'Scalable NoSQL database for real-time apps.' },
      { name: 'MongoDB', level: 80, color: 'bg-green-500', icon: Archive, description: 'Flexible NoSQL database for large datasets.' },
      { name: 'MySQL', level: 70, color: 'bg-blue-500', icon: Database, description: 'Relational database for structured data.' },
    ],
  },
  {
    title: 'Cloud & DevOps',
    icon: Cloud,
    technologies: [
      { name: 'Google Cloud', level: 70, color: 'bg-blue-500', icon: Cloud, description: 'Cloud platform for hosting and services.' },
      { name: 'GitHub', level: 80, color: 'bg-blue-600', icon: Github, description: 'Version control and CI/CD workflows.' },
      { name: 'Render', level: 65, color: 'bg-blue-700', icon: Upload, description: 'Simplified cloud hosting for apps.' },
      { name: 'Vercel', level: 85, color: 'bg-black', icon: Zap, description: 'Platform for deploying Next.js apps.' },
    ],
  },
  {
    title: 'Design & Tools',
    icon: Palette,
    technologies: [
      { name: 'Figma', level: 80, color: 'bg-purple-500', icon: Figma, description: 'Collaborative design and prototyping tool.' },
      { name: 'Adobe XD', level: 75, color: 'bg-pink-500', icon: Paintbrush, description: 'UI/UX design and prototyping.' },
      { name: 'Git', level: 90, color: 'bg-orange-600', icon: Github, description: 'Version control for code collaboration.' },
      { name: 'VS Code', level: 95, color: 'bg-blue-500', icon: Monitor, description: 'Powerful code editor for development.' },
      { name: 'Blender', level: 70, color: 'bg-yellow-500', icon: Image, description: '3D modeling and animation tool.' },
      { name: 'Adobe Illustrator', level: 60, color: 'bg-gray-600', icon: Paintbrush, description: 'Vector graphics design.' },
    ],
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
}

export default function TechPage() {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-warm dark:bg-gradient-warm-dark bg-[url('/pattern.png')] bg-opacity-10 py-20"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center px-4 py-2 bg-rose-500/10 text-rose-500 rounded-full text-sm font-medium mb-6"
          >
            <Code className="h-4 w-4 mr-2" />
            My Toolkit
          </motion.div>
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6"
          >
            Tech <span className="bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">Stack</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-muted-foreground max-w-3xl mx-auto"
          >
            The tools and technologies I wield to bring ideas to life. From frontend to DevOps, here’s my arsenal. 🛠️
          </motion.p>
        </motion.div>

        {/* Tech Categories */}
        <div className="space-y-16">
          {techCategories.map((category, categoryIndex) => {
            const Icon = category.icon
            return (
              <motion.section
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className="space-y-8"
              >
                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-rose-500/10 rounded-lg flex items-center justify-center">
                    <Icon className="h-6 w-6 text-rose-500" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                    {category.title}
                  </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.technologies.map((tech, techIndex) => {
                    const TechIcon = tech.icon
                    return (
                      <motion.div
                        key={tech.name}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: techIndex * 0.05 }}
                        whileHover={{ y: -5 }}
                        className="group relative p-6 bg-white/50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <TechIcon className="h-5 w-5 text-foreground" />
                            <h3 className="text-lg font-semibold text-foreground">{tech.name}</h3>
                          </div>
                          <span className="text-sm text-muted-foreground">{tech.level}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <motion.div
                            className={`h-2 rounded-full ${tech.color}`}
                            initial={{ width: 0 }}
                            whileInView={{ width: `${tech.level}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: techIndex * 0.1 }}
                          />
                        </div>
                        <div className="absolute left-0 top-full mt-2 hidden group-hover:block bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-2 shadow-lg text-sm text-muted-foreground z-10">
                          {tech.description}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.section>
            )
          })}
        </div>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
            Let’s Build Something Amazing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Ready to leverage these technologies for your project? Let’s create something epic together! 🚀
          </p>
          <a
            href="/contact"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all hover:scale-105"
          >
            <Mail className="h-5 w-5" />
            <span>Get In Touch</span>
            <ArrowRight className="h-5 w-5" />
          </a>
        </motion.section>
      </div>
    </motion.div>
  )
}