export default function TicketInfo() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          Ticket Information
        </h2>

        <div className="space-y-6 text-left backdrop-blur-md p-8 rounded-lg border border-dreamstate-lavender/40" style={{ backgroundColor: 'rgba(24,33,55,0.6)' }}>
          <div>
            <h3 className="text-xl font-semibold mb-3 text-purple-400">
              What&apos;s Included
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Full access to all performance areas</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Faction-specific experiences and activities</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Welcome gift and faction merchandise</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Access to food and beverage areas</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-dreamstate-lavender/40">
            <h3 className="text-xl font-semibold mb-3 text-purple-400">
              Important Details
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Event date, time, and location details</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Age restrictions and requirements</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Refund and transfer policy</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
