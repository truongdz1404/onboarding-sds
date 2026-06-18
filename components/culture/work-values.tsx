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
          className="group flex flex-col gap-3 rounded-xl bg-white border border-border shadow-sm p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
          <span className="w-fit rounded-md bg-primary/10 px-2.5 py-1 text-sm font-bold tabular-nums text-primary">
            {v.n}
          </span>
          <h3 className="text-xl font-bold tracking-tight text-text-dark">{v.title}</h3>
          <p className="text-sm leading-relaxed text-muted-foreground">{v.desc}</p>
        </motion.div>
      ))}
    </div>
  )
}
