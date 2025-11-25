'use client'

import { motion } from 'framer-motion'
import { Eye, Heart } from 'lucide-react'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Interface } from 'readline'

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  hover: { scale: 1.05, transition: { duration: 0.3 } }
}
interface ProjectCardProps {
  id: string;
  title: string; 
  description: string;
  image: string;
  category: string;
  tags?: string[];
  summary?: string;
  likes?: number;
  views?: number;
  featured?: boolean;
  onLike: () => void;
  onView: () => void;
}

export default function ProjectCard({ id, title, description, image, category, tags = [], summary, likes = 0, views = 0, onLike, onView }: ProjectCardProps) {
  return (
    <Link href={`/projects/${id}`}>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 cursor-pointer"
        onClick={onView}
      >
        <img
          src={image || '/placeholder.png'}
          alt={title}
          className="w-full h-48 object-cover rounded-xl mb-4"
        />
        <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{title}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{summary || description}</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center px-2 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs">
            {category}
          </span>
          {tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2 py-1 bg-rose-500/10 text-rose-500 rounded-full text-xs"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={(e) => {
              e.stopPropagation()
              e.preventDefault()
              onLike()
            }}
            className="flex items-center gap-1 text-muted-foreground hover:text-rose-500"
          >
            <Heart className="h-4 w-4" /> {likes}
          </button>
          <span className="flex items-center gap-1 text-muted-foreground">
            <Eye className="h-4 w-4" /> {views}
          </span>
        </div>
      </motion.div>
    </Link>
  )
}