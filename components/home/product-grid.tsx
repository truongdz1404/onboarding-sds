'use client'

import Image from 'next/image'
import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { SectionHeader } from '@/components/shared/section-header'

type Product = {
  name: string
  category: string
  desc: string
  icon: string
  featured: boolean
}

const products: Product[] = [
  {
    name: 'EasyInvoice',
    category: 'Hóa đơn điện tử',
    desc: 'Phát hành & quản lý hóa đơn điện tử tuân thủ quy định thuế.',
    icon: '/images/products/easyinvoice.png',
    featured: true,
  },
  {
    name: 'EasyBooks',
    category: 'Phần mềm kế toán',
    desc: 'Quản lý sổ sách, báo cáo tài chính nhanh chóng và chính xác.',
    icon: '/images/products/easybooks.png',
    featured: false,
  },
  {
    name: 'EasyCA',
    category: 'Chữ ký số',
    desc: 'Giải pháp chữ ký số an toàn cho doanh nghiệp & cá nhân.',
    icon: '/images/products/easyca.png',
    featured: true,
  },
  {
    name: 'EasyPOS',
    category: 'Quản lý bán hàng',
    desc: 'Quản lý bán hàng đa kênh, tồn kho và doanh thu real-time.',
    icon: '/images/products/easypos.png',
    featured: false,
  },
  {
    name: 'EasyDocs',
    category: 'Hợp đồng điện tử',
    desc: 'Ký kết & lưu trữ hợp đồng điện tử có giá trị pháp lý.',
    icon: '/images/products/easydocs.png',
    featured: true,
  },
  {
    name: 'EasyHRM',
    category: 'Quản lý nhân sự',
    desc: 'Chấm công, tính lương, quản lý nhân sự toàn diện.',
    icon: '/images/products/easyhrm.png',
    featured: false,
  },
]

function FlipCard({ product, index }: { product: Product; index: number }) {
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
          className={`absolute inset-0 flex flex-col justify-between rounded-xl p-6 [backface-visibility:hidden] bg-white shadow-sm ${
            product.featured ? 'border-2 border-primary/40' : 'border border-border'
          }`}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-surface-orange">
            <Image
              src={product.icon}
              alt={product.name}
              width={36}
              height={36}
              className="object-contain"
            />
          </div>
          <div>
            <span className="eyebrow inline-block rounded-md bg-primary/10 px-2.5 py-1 text-primary">
              {product.category}
            </span>
            <h3 className="mt-3 text-xl font-bold tracking-tight text-text-dark">
              {product.name}
            </h3>
          </div>
        </div>

        {/* Back */}
        <div
          className={`absolute inset-0 flex flex-col justify-between rounded-xl p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white shadow-sm ${
            product.featured ? 'border-2 border-primary/40' : 'border border-border'
          }`}
        >
          <div>
            <h3 className="text-xl font-bold tracking-tight text-text-dark">
              {product.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
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
    <section className="bg-surface-white py-24">
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
