'use client'

import { motion } from 'motion/react'
import {
  FileText,
  Calculator,
  ShieldCheck,
  ShoppingCart,
  FileSignature,
  Users,
  ArrowRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { SectionHeader } from '@/components/shared/section-header'

type Product = {
  name: string
  category: string
  desc: string
  icon: LucideIcon
  bg: string
  badge: string
  iconBg: string
}

const products: Product[] = [
  {
    name: 'EasyInvoice',
    category: 'Hóa đơn điện tử',
    desc: 'Phát hành & quản lý hóa đơn điện tử tuân thủ quy định thuế.',
    icon: FileText,
    bg: 'bg-primary/10',
    badge: 'bg-primary text-white',
    iconBg: 'bg-primary',
  },
  {
    name: 'EasyBooks',
    category: 'Phần mềm kế toán',
    desc: 'Quản lý sổ sách, báo cáo tài chính nhanh chóng và chính xác.',
    icon: Calculator,
    bg: 'bg-blue-50',
    badge: 'bg-blue-600 text-white',
    iconBg: 'bg-blue-600',
  },
  {
    name: 'EasyCA',
    category: 'Chữ ký số',
    desc: 'Giải pháp chữ ký số an toàn cho doanh nghiệp & cá nhân.',
    icon: ShieldCheck,
    bg: 'bg-green-50',
    badge: 'bg-green-600 text-white',
    iconBg: 'bg-green-600',
  },
  {
    name: 'EasyPOS',
    category: 'Quản lý bán hàng',
    desc: 'Quản lý bán hàng đa kênh, tồn kho và doanh thu real-time.',
    icon: ShoppingCart,
    bg: 'bg-teal-50',
    badge: 'bg-teal-600 text-white',
    iconBg: 'bg-teal-600',
  },
  {
    name: 'EasyDocs',
    category: 'Hợp đồng điện tử',
    desc: 'Ký kết & lưu trữ hợp đồng điện tử có giá trị pháp lý.',
    icon: FileSignature,
    bg: 'bg-amber-50',
    badge: 'bg-amber-600 text-white',
    iconBg: 'bg-amber-600',
  },
  {
    name: 'EasyHRM',
    category: 'Quản lý nhân sự',
    desc: 'Chấm công, tính lương, quản lý nhân sự toàn diện.',
    icon: Users,
    bg: 'bg-rose-50',
    badge: 'bg-rose-600 text-white',
    iconBg: 'bg-rose-600',
  },
]

function FlipCard({ product, index }: { product: Product; index: number }) {
  const Icon = product.icon
  return (
    <motion.div
      className="group h-56 [perspective:1200px]"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <div className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
        {/* Front */}
        <div
          className={`absolute inset-0 flex flex-col justify-between rounded-lg p-6 [backface-visibility:hidden] ${product.bg}`}
        >
          <div
            className={`flex h-14 w-14 items-center justify-center rounded-lg ${product.iconBg}`}
          >
            <Icon size={28} className="text-white" strokeWidth={2} />
          </div>
          <div>
            <span
              className={`eyebrow inline-block rounded-md px-2.5 py-1 ${product.badge}`}
            >
              {product.category}
            </span>
            <h3 className="mt-3 text-xl font-bold tracking-tight">
              {product.name}
            </h3>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 flex flex-col justify-between rounded-lg p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] ${product.bg}`}
        >
          <div>
            <h3 className="text-xl font-bold tracking-tight">{product.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground/70">
              {product.desc}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
            Tìm hiểu thêm
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </motion.div>
  )
}

export function ProductGrid() {
  return (
    <section className="bg-background py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeader
          eyebrow="Hệ sinh thái"
          title="6 sản phẩm định hình hệ sinh thái"
          description="Bộ giải pháp toàn diện giúp doanh nghiệp số hóa mọi nghiệp vụ. Di chuột để xem chi tiết."
        />
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p, i) => (
            <FlipCard key={p.name} product={p} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
