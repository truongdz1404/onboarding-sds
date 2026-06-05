'use client'

import { motion } from 'motion/react'

const values = [
  { n: '01', title: 'Trách nhiệm', desc: 'Hoàn toàn chịu trách nhiệm về nội dung, kết quả và tiến độ công việc.' },
  { n: '02', title: 'Đam mê', desc: 'Cái nhìn tích cực — xem khó khăn là cơ hội để thể hiện bản thân.' },
  { n: '03', title: 'Chủ động', desc: 'Không chờ giao việc, chủ động xin ý kiến và đề xuất giải pháp.' },
  { n: '04', title: 'Sáng tạo', desc: 'Tìm phương án tối ưu, phân tích kỹ lưỡng trước khi bắt tay làm.' },
  { n: '05', title: 'Kỷ luật', desc: 'Tuân thủ quy trình, làm đúng chức năng và quyền hạn được giao.' },
  { n: '06', title: 'Chuẩn mực', desc: 'Giải quyết nhanh, tổ chức khoa học, ưu tiên đúng việc đúng lúc.' },
]

export function WorkValues() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {values.map((v, i) => (
        <motion.div
          key={v.n}
          className="group flex flex-col gap-3 rounded-lg bg-muted p-6 transition-all duration-200 hover:scale-[1.02] hover:bg-[#ebedf0]"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
        >
          <span className="w-fit rounded-md border-2 border-primary/20 bg-primary/10 px-2.5 py-1 text-sm font-bold tabular-nums text-primary">
            {v.n}
          </span>
          <h3 className="text-xl font-bold tracking-tight">{v.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {v.desc}
          </p>
        </motion.div>
      ))}
    </div>
  )
}
