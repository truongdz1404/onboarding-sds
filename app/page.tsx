import { Hero } from '@/components/home/hero'
import { QuickAccess } from '@/components/home/quick-access'
import { Timeline } from '@/components/home/timeline'
import { MissionVision } from '@/components/home/mission-vision'
import { ProductGrid } from '@/components/home/product-grid'
import { AITeaser } from '@/components/home/ai-teaser'

export default function HomePage() {
  return (
    <>
      <Hero />
      <QuickAccess />
      <Timeline />
      <MissionVision />
      <ProductGrid />
      <AITeaser />
    </>
  )
}
