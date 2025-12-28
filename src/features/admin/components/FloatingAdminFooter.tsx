'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  MessageCircle, 
  Facebook, 
  Instagram, 
  Linkedin, 
  Youtube,
  ExternalLink,
  ShieldCheck,
  Globe
} from 'lucide-react'
import { useSidebarStore } from '@/stores/sidebarStore'

export default function FloatingAdminFooter() {
  const { activeSection } = useSidebarStore()
  
  const socialLinks = [
    { icon: <Mail className="w-3 h-3" />, href: "mailto:info@dgtecnova.com", label: "Email", color: "hover:text-blue-400" },
    { icon: <MessageCircle className="w-3 h-3" />, href: "https://wa.me/yournumber", label: "WhatsApp", color: "hover:text-green-400" },
    { icon: <Facebook className="w-3 h-3" />, href: "#", label: "Facebook", color: "hover:text-blue-600" },
    { icon: <Instagram className="w-3 h-3" />, href: "#", label: "Instagram", color: "hover:text-pink-500" },
    { icon: <Linkedin className="w-3 h-3" />, href: "#", label: "LinkedIn", color: "hover:text-blue-500" },
    { icon: <Youtube className="w-3 h-3" />, href: "#", label: "YouTube", color: "hover:text-red-500" },
  ]
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-10 left-0 z-[45] w-56 px-3 pointer-events-none flex flex-col gap-2"
    >
      <div className="bg-[#161b22]/95 backdrop-blur-xl border border-gh-border rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden flex flex-col border-b-gh-success/30">
        {/* Branding Header */}
        <div className="px-4 py-3 bg-gradient-to-br from-gh-success/10 via-transparent to-transparent border-b border-gh-border/50">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gh-success animate-pulse" />
              <span className="text-[10px] font-bold text-gh-accent uppercase tracking-widest">WebQuote</span>
            </div>
            <span className="text-[9px] text-gh-text-muted font-mono bg-gh-bg-tertiary px-1.5 py-0.5 rounded border border-gh-border/50">v1.4.0</span>
          </div>
          <p className="text-[10px] text-gh-text-muted leading-tight">Sistema de Gestión de Cotizaciones en la nube</p>
        </div>

        {/* Company Info */}
        <div className="px-3 py-2.5 space-y-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gh-text uppercase tracking-wider">DG TECNOVA</span>
            <span className="text-[9px] text-gh-text-muted leading-tight mt-0.5">Consultoría y Desarrollo de Soluciones Informáticas</span>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <div className="bg-gh-bg-tertiary/50 border border-gh-border/30 rounded p-1.5 text-center">
              <p className="text-[10px] font-bold text-gh-accent">48</p>
              <p className="text-[7px] text-gh-text-muted uppercase tracking-wider">Secciones</p>
            </div>
            <div className="bg-gh-bg-tertiary/50 border border-gh-border/30 rounded p-1.5 text-center">
              <p className="text-[10px] font-bold text-gh-success">6</p>
              <p className="text-[7px] text-gh-text-muted uppercase tracking-wider">Módulos</p>
            </div>
          </div>
        </div>

        {/* Social & Contact Links */}
        <div className="px-3 py-2 bg-gh-bg-tertiary/30 border-t border-gh-border/50">
          <div className="flex items-center justify-between gap-1">
            {socialLinks.map((link, i) => (
              <a 
                key={i}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 rounded-md text-gh-text-muted transition-all duration-200 ${link.color} hover:bg-gh-bg-tertiary`}
                title={link.label}
              >
                {link.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Copyright Footer */}
        <div className="px-3 py-1.5 bg-gh-bg-tertiary/50 flex items-center justify-center border-t border-gh-border/30">
          <p className="text-[8px] text-gh-text-muted/70 font-medium italic">
            © {new Date().getFullYear()} • Todos los derechos reservados
          </p>
        </div>
      </div>
    </motion.div>
  )
}
