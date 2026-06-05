export function TaxInfo() {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-lg border-l-4 border-primary bg-primary/5 p-6">
        <p className="eyebrow text-primary">CTV & Thử việc</p>
        <p className="mt-3 leading-relaxed">
          Khấu trừ <span className="font-bold">10% thuế TNCN</span> nếu thu nhập{' '}
          <span className="font-bold">≥ 2.000.000đ</span> mỗi lần chi trả.
        </p>
      </div>
      <div className="rounded-lg border-l-4 border-secondary bg-secondary/5 p-6">
        <p className="eyebrow text-secondary">Nhân viên chính thức</p>
        <p className="mt-3 leading-relaxed">
          Tạm trừ thuế <span className="font-bold">hàng tháng</span>, thực hiện{' '}
          <span className="font-bold">quyết toán vào tháng 3</span> năm sau.
        </p>
      </div>
    </div>
  )
}
