
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import SketchUnderline from '../components/home/SketchUnderline'

export default function About() {
  const services = [
    { title: "Franchise Modelling", description: "Comprehensive franchise development and modeling services", img: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80" },
    { title: "Financial Projections", description: "Detailed financial analysis and projections for franchise opportunities", img: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&q=80" },
  { title: "Events Representation", description: "Professional representation at franchise and business events", img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80" },
    { title: "Investor Acquisition", description: "Strategic investor acquisition and partnership development", img: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80" },
    { title: "Market Research & GAP Analysis", description: "Comprehensive market research and demand estimation", img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80" },
    { title: "Property Scouting", description: "Pan India and International property scouting services", img: "https://images.unsplash.com/photo-1494526585095-c41746248156?w=800&q=80" },
  { title: "Architectural Designs", description: "Custom architectural designs for franchise locations", img: "https://plus.unsplash.com/premium_photo-1726840832490-c5e188a900f4?w=800&q=80" },
    { title: "HR / Manpower Services", description: "Complete human resource and manpower solutions", img: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80" },
    { title: "Vendor Development", description: "Strategic vendor development and supply chain management", img: "https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80" },
    { title: "Banking Escrow Services", description: "Secure banking escrow services for royalty fee sharing", img: "https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&q=80" },
    { title: "Lead Generation", description: "Digital marketing and events for lead generation", img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80" },
  ]

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Navbar />
  <main className="pt-0">
        {/* Hero Section */}
        <section className="relative bg-transparent py-20 border-b border-slate-200 shadow-xl pt-0 mt-0">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-2 font-sans mt-16 md:mt-24">
              About Rodar Franchise World
            </h1>
            <div className="flex justify-center">
              <SketchUnderline width={340} height={16} strokeWidth={6} tilt={-1} className="mb-2" color="#e3ae00" />
            </div>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto font-sans mt-8">
              Your trusted partner in franchise development and Franchise World
            </p>
          </div>
        </section>

        {/* Company Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-slate-800 mb-2 font-sans text-center">Our Company</h2>
                <div className="flex justify-center">
                  <SketchUnderline width={270} height={18} strokeWidth={5} tilt={1} className="mb-4" color="#e3ae00" />
                </div>
                <div className="space-y-4 text-slate-700 font-sans bg-white rounded-2xl p-8 shadow-xl">
                  <p className="text-lg">
                    Rodar Franchise World was founded in Chennai, India by
                    <span className="text-[#e3ae00] font-semibold"> Pugazhenthi Ethiraj</span>, who has over two decades of Franchise World
                    experience. The team has the brightest minds in this arena with
                    international experience and roots in the alma mater of NIT Trichy.
                  </p>
                  <p className="text-lg">
                    The company, under his eminent leadership, is growing by leaps and
                    bounds. The main reason is the great service it provides to its
                    clients and the strong support shown by satisfied clients.
                  </p>
                  <p className="text-lg">
                    Rodar has worked with many startups and elite brands, providing
                    formidable services for their growth in a short span of time through
                    <span className="text-[#e3ae00] font-semibold"> franchising</span>. It has been well recognised with many accolades from
                    clients of a varied range of businesses. Going miles and miles together with the client, Rodar is happy to keep
                    and deliver all the promises en route. Rodar strives to create successful clientele through excellence in
                    service.
                  </p>
                </div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-2xl">
                <div className="text-center">
                  <img
                    src="/client_meet.png"
                    alt="Excellence in Franchise Consulting"
                    className="mx-auto mb-10 w-[28rem] h-80 object-cover rounded-3xl shadow-lg border-2 border-[#e3ae00]/30"
                  />
                  <h3 className="text-2xl font-bold text-slate-800 mb-4 font-sans">Excellence in Franchise Consulting</h3>
                  <p className="text-slate-700 font-sans">
                    We bring royal treatment to every franchise partnership, ensuring 
                    our clients receive the highest quality service and support.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Founder Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="order-2 lg:order-1">
                <div className="bg-white rounded-2xl p-8 shadow-2xl">
                  <div className="text-center">
                    <img
                      src="/Pugazhenthi 002.jpg"
                      alt="PUGAZHENTHI ETHIRAJ - Founder & CEO"
                      className="w-40 h-40 rounded-full mx-auto mb-6 object-cover shadow-lg border-2 border-[#e3ae00]/30"
                    />
                    <h3 className="text-2xl font-bold text-slate-800 mb-1 font-sans">Founder & CEO</h3>
                    <p className="text-sm text-[#e3ae00] font-semibold mb-4 font-sans">
                      PUGAZHENTHI ETHIRAJ B.E., M.B.A.,
                    </p>
                    <p className="text-slate-700 font-sans">
                      A visionary leader with over 15 years of experience in franchise development 
                      and Franchise World.
                    </p>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="text-4xl font-bold text-slate-800 mb-2 font-sans text-center">Meet Our Founder</h2>
                <div className="flex justify-center">
                  <SketchUnderline width={310} height={18} strokeWidth={5} tilt={-2} className="mb-6" color="#e3ae00" />
                </div>
                <div className="space-y-4 text-slate-700 font-sans bg-white rounded-2xl p-8 shadow-xl">
                  <p className="text-lg">
                    Mr. Pugazhenthi Ethiraj brings a unique combination of entrepreneurial experience and 
                    deep industry knowledge to every project. With a background in both franchise 
                    operations and business development, he understands the challenges and 
                    opportunities that come with franchise ownership.
                  </p>
                  <p className="text-lg">
                    Having personally experienced the franchise journey from both sides of the table, 
                    our founder is passionate about creating win-win partnerships that benefit both 
                    franchisors and franchisees. This dual perspective allows us to provide 
                    unparalleled insights and guidance.
                  </p>
                  <p className="text-lg">
                    Under his leadership, Rodar Franchise World has grown to become one of 
                    the most trusted names in franchise consulting, with a track record of successful 
                    partnerships and satisfied clients across the country.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-slate-800 mb-2 font-sans">Our Services</h2>
              <div className="flex justify-center">
                <SketchUnderline width={240} height={18} strokeWidth={5} tilt={-1} className="mb-4" color="#e3ae00" />
              </div>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto font-sans mt-12 md:mt-8">
                Comprehensive solutions for all your franchise and business needs
              </p>
            </div>

            {/* Apple-style Bento Box Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div
                  key={index}
                  className={`
                    group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 hover:scale-105 hover:shadow-2xl
                    bg-white
                  `}
                >
                  <div className="relative z-10 text-center">
                    <img
                      src={service.img}
                      alt={service.title}
                      className="w-full h-56 rounded-3xl mb-4 object-cover ring-2 ring-[#e3ae00]/30"
                    />
                    <h3 className="text-xl font-bold text-slate-800 mb-3 font-sans group-hover:text-[#e3ae00] transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-700 group-hover:text-[#e3ae00] transition-colors font-sans">
                      {service.description}
                    </p>
                  </div>
                  {/* Hover Effect Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-[#e3ae00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-yellow-50 to-yellow-100 border-t border-slate-200">
          <div className="max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold text-slate-800 mb-6 font-sans">
              Ready to Start Your Franchise Journey?
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto font-sans">
              Let us help you find the perfect franchise opportunity and guide you through every step of the process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/search" className="bg-[#e3ae00] text-black px-8 py-4 rounded-lg font-semibold hover:bg-yellow-500 transition-colors font-sans shadow-lg">
                Browse Franchises
              </a>
              <a href="/contact" className="bg-white text-[#e3ae00] px-8 py-4 rounded-lg font-semibold hover:bg-yellow-50 transition-colors font-sans shadow-lg">
                Contact Us
              </a>
            </div>
          </div>
        </section>
      </main>

  <Footer />
    </div>
  )
}
