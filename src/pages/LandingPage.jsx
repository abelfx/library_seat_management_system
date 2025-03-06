import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6">
        <div className="text-2xl font-bold">LibrarySeats</div>
        <div className="flex gap-8">
          <Link to="#features" className="text-gray-600 hover:text-gray-900">
            Features
          </Link>
          <Link to="#demo" className="text-gray-600 hover:text-gray-900">
            Demo
          </Link>
          <Link
            to="#testimonials"
            className="text-gray-600 hover:text-gray-900"
          >
            Testimonials
          </Link>
        </div>
        <Link
          to="/login"
          className="px-4 py-2 border rounded-md hover:bg-gray-50"
        >
          Login
        </Link>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-6xl font-bold leading-tight mb-6">
              Library Seats,
              <br />
              Reserved Your Way.
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Real-time availability. Seamless university login. No more seat
              hunting.
            </p>
            <div className="flex gap-4">
              <Link
                to="/login"
                className="px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 flex items-center"
              >
                Reserve Now
                <svg
                  className="w-4 h-4 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
              <Link
                to="#learn-more"
                className="px-6 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Learn More
              </Link>
            </div>
          </div>
          {/* Updated Placeholder Image */}
          <img
            src="https://i.pinimg.com/474x/10/fd/20/10fd20d9a4bbc60ef41143fe5e3859b6.jpg"
            alt="Library Seats Demo"
            className="rounded-lg w-full max-h-100 object-cover"
          />
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            Smart Features for Seamless Booking
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Everything you need to find and reserve the perfect study spot.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🕒",
                title: "Real-time Availability",
                description:
                  "See which seats are free right now and for how long.",
              },
              {
                icon: "🔒",
                title: "University SSO Login",
                description:
                  "Secure access with your existing university credentials.",
              },
              {
                icon: "📅",
                title: "Fair Usage Policy",
                description:
                  "Time limits ensure everyone gets a chance to study.",
              },
              {
                icon: "💻",
                title: "Mobile & Desktop Ready",
                description: "Book from any device, anywhere on campus.",
              },
              {
                icon: "🔔",
                title: "Notifications & Reminders",
                description:
                  "Never miss your reservation or overstay your welcome.",
              },
              {
                icon: "🏛️",
                title: "Integrated with Library Systems",
                description:
                  "Works with your library's existing infrastructure.",
              },
            ].map((feature, index) => (
              <div key={index} className="p-6 bg-white rounded-lg shadow-sm">
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div id="demo" className="py-20 bg-black text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-gray-400 text-center mb-12">
            Intuitive interfaces for both students and administrators.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-800 rounded-lg aspect-[9/16] p-4">
              <div className="text-center mt-4">
                <h3 className="text-xl font-semibold mb-2">
                  Student Mobile App
                </h3>
                <p className="text-gray-400">Find and book seats on the go.</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg aspect-video p-4">
              <div className="text-center mt-4">
                <h3 className="text-xl font-semibold mb-2">Admin Dashboard</h3>
                <p className="text-gray-400">
                  Powerful tools for library management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">
            Why Students Love It
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12">
            Hear from our users across campus.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white border rounded-lg">
              <p className="text-xl font-semibold mb-4">
                "Finally, no more seat-hunting stress."
              </p>
              <div>
                <p className="font-semibold">Sarah J.</p>
                <p className="text-gray-600">Computer Science Student</p>
              </div>
            </div>
            <div className="p-6 bg-white border rounded-lg">
              <p className="text-xl font-semibold mb-4">
                "We manage library space 2x better now."
              </p>
              <div>
                <p className="font-semibold">Dr. Michael T.</p>
                <p className="text-gray-600">Library Administrator</p>
              </div>
            </div>
            <div className="p-6 bg-white border rounded-lg">
              <p className="text-xl font-semibold mb-4">"It just works."</p>
              <div>
                <p className="font-semibold">James R.</p>
                <p className="text-gray-600">University IT Officer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-black text-white text-center">
        <h2 className="text-4xl font-bold mb-8">
          Study Smarter. Book Your Seat Today.
        </h2>
        <Link
          to="/get-started"
          className="inline-flex items-center px-6 py-3 bg-white text-black rounded-md hover:bg-gray-100"
        >
          Get Started
          <svg
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-black text-gray-400 py-8 text-center">
        <p className="mb-2">Built with Firebase, Vite, and Tailwind CSS.</p>
        <p>Secure University Login powered by SSO.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
