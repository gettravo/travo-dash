export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Travo — API Health Monitor
          </p>
          <p className="text-sm text-gray-600">
            Checks run every minute · Data retained for 7 days
          </p>
        </div>
      </div>
    </footer>
  )
}
