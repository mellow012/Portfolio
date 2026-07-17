'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Twitter, ArrowUpRight, MapPin } from 'lucide-react'
import { MellowverseLogo } from './Logo'

const socialLinks = [
  { name: 'GitHub', href: 'https://github.com', icon: Github },
  { name: 'LinkedIn', href: 'https://linkedin.com', icon: Linkedin },
  { name: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { name: 'Email', href: 'mailto:wiz116mlambia@gmail.com', icon: Mail },
]

const quickLinks = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Projects', href: '/projects' },
  { name: 'Tech Stack', href: '/tech' },
  { name: 'Contact', href: '/contact' },
]

export default function Footer() {
  return (
    <footer className="relative border-t border-[#464554]/50 bg-[#101415] overflow-hidden">
      {/* Decorative gradient line at top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c0c1ff] to-transparent" />

      {/* Soft background glow */}
      <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-[#c0c1ff]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* ── Brand column ── */}
          <div className="md:col-span-5 space-y-6">
            <MellowverseLogo variant="compact" />

            <p className="text-[#908fa0] text-sm leading-relaxed max-w-xs">
              Building elegant, performant software for real-world impact.
              Full-stack, remote-ready, and always shipping.
            </p>

            <div className="flex items-center gap-1.5 text-xs text-[#908fa0]">
              <MapPin className="h-3.5 w-3.5 text-[#c0c1ff]/70" />
              Malawi · GMT+2 · Available worldwide
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon
                return (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.12, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 rounded-xl bg-[#272a2c] flex items-center justify-center text-[#908fa0] hover:text-[#c0c1ff] hover:bg-[#c0c1ff]/10 transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                )
              })}
            </div>
          </div>

          {/* ── Navigation column ── */}
          <div className="md:col-span-3 md:col-start-7">
            <h3 className="text-xs font-semibold text-[#e0e3e5] mb-5 tracking-widest uppercase">
              Navigation
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-1 text-sm text-[#c7c4d7] hover:text-[#c0c1ff] transition-colors"
                  >
                    <ArrowUpRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── CTA column ── */}
          <div className="md:col-span-3">
            <h3 className="text-xs font-semibold text-[#e0e3e5] mb-5 tracking-widest uppercase">
              Let's Work Together
            </h3>
            <p className="text-sm text-[#908fa0] mb-5 leading-relaxed">
              Have a project in mind? I'd love to hear about it and see how I can help.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#c0c1ff] text-[#1000a9] text-sm font-medium hover:bg-[#c0c1ff]/90 transition-all hover:shadow-lg hover:shadow-[#c0c1ff]/20 active:scale-95"
            >
              Start a conversation
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-14 pt-8 border-t border-[#464554]/50 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-[#908fa0]">
            © {new Date().getFullYear()} Mellowverse · Crafted with care in Malawi 🇲🇼
          </p>
          <div className="flex gap-5 text-xs text-[#908fa0]">
            <Link href="/privacy" className="hover:text-[#c0c1ff] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-[#c0c1ff] transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}