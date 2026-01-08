# BarLink Project - Complete File Generation Script
# This script creates all necessary files for the BarLink application

Write-Host "Creating BarLink application files..." -ForegroundColor Green

# Create Home Page
'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function HomePage() {
  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className=\"bg-linear-to-br from-purple-900 via-indigo-900 to-blue-900 text-white py-20\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center\">
          <h1 className=\"text-5xl md:text-6xl font-bold mb-6 leading-tight\">
            Find what's happening at bars—<br />by day, by vibe, by activity.
          </h1>
          <p className=\"text-xl md:text-2xl mb-8 text-purple-200 max-w-3xl mx-auto\">
            BarLink helps patrons discover darts, trivia, karaoke, live music, drink specials, and more—instantly on a map.
          </p>
          <div className=\"flex flex-col sm:flex-row gap-4 justify-center\">
            <Link
              href=\"/auth/signup\"
              className=\"px-8 py-4 bg-white text-purple-900 rounded-lg font-bold text-lg hover:bg-purple-100 transition shadow-lg\"
            >
              List Your Bar
            </Link>
            <Link
              href=\"/explore\"
              className=\"px-8 py-4 bg-purple-700 text-white rounded-lg font-bold text-lg hover:bg-purple-600 transition border-2 border-white\"
            >
              Explore Bars
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className=\"py-16 bg-gray-50\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <h2 className=\"text-4xl font-bold text-center mb-12 text-gray-900\">How It Works</h2>
          <div className=\"grid md:grid-cols-3 gap-8\">
            <div className=\"text-center p-6\">
              <div className=\"text-5xl mb-4\">📍</div>
              <h3 className=\"text-xl font-bold mb-3 text-gray-900\">Owners Add Offerings</h3>
              <p className=\"text-gray-600\">
                Bar owners create their profile and add daily activities, specials, and events
              </p>
            </div>
            <div className=\"text-center p-6\">
              <div className=\"text-5xl mb-4\">🔍</div>
              <h3 className=\"text-xl font-bold mb-3 text-gray-900\">Patrons Search</h3>
              <p className=\"text-gray-600\">
                Users search by day of the week and activity type to find the perfect spot
              </p>
            </div>
            <div className=\"text-center p-6\">
              <div className=\"text-5xl mb-4\">🗺️</div>
              <h3 className=\"text-xl font-bold mb-3 text-gray-900\">See Results on Map</h3>
              <p className=\"text-gray-600\">
                BarLink shows matching bars instantly on an interactive map
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className=\"py-16\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <h2 className=\"text-4xl font-bold text-center mb-12 text-gray-900\">Perfect For</h2>
          <div className=\"grid md:grid-cols-3 gap-8\">
            <div className=\"bg-white p-6 rounded-lg shadow-md\">
              <h3 className=\"text-xl font-bold mb-3 text-purple-900\">🧳 Tourists & Travelers</h3>
              <p className=\"text-gray-600\">
                Find the best local nightlife without asking around or endless scrolling
              </p>
            </div>
            <div className=\"bg-white p-6 rounded-lg shadow-md\">
              <h3 className=\"text-xl font-bold mb-3 text-purple-900\">💼 Business Travelers</h3>
              <p className=\"text-gray-600\">
                Discover nearby bars with specific activities during your weeknight stay
              </p>
            </div>
            <div className=\"bg-white p-6 rounded-lg shadow-md\">
              <h3 className=\"text-xl font-bold mb-3 text-purple-900\">🏠 Locals Planning Ahead</h3>
              <p className=\"text-gray-600\">
                See what's happening tomorrow, this weekend, or any day you want to go out
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className=\"py-16 bg-gray-50\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <h2 className=\"text-4xl font-bold text-center mb-12 text-gray-900\">Key Features</h2>
          <div className=\"grid md:grid-cols-2 lg:grid-cols-3 gap-6\">
            <div className=\"flex items-start space-x-3 p-4 bg-white rounded-lg shadow\">
              <span className=\"text-2xl\">🗺️</span>
              <div>
                <h4 className=\"font-bold text-gray-900\">Map-Based Search</h4>
                <p className=\"text-gray-600 text-sm\">See bars on an interactive map</p>
              </div>
            </div>
            <div className=\"flex items-start space-x-3 p-4 bg-white rounded-lg shadow\">
              <span className=\"text-2xl\">📅</span>
              <div>
                <h4 className=\"font-bold text-gray-900\">Day-of-Week Filtering</h4>
                <p className=\"text-gray-600 text-sm\">Find what's happening any day</p>
              </div>
            </div>
            <div className=\"flex items-start space-x-3 p-4 bg-white rounded-lg shadow\">
              <span className=\"text-2xl\">🎯</span>
              <div>
                <h4 className=\"font-bold text-gray-900\">Activity Search</h4>
                <p className=\"text-gray-600 text-sm\">Filter by trivia, karaoke, and more</p>
              </div>
            </div>
            <div className=\"flex items-start space-x-3 p-4 bg-white rounded-lg shadow\">
              <span className=\"text-2xl\">⭐</span>
              <div>
                <h4 className=\"font-bold text-gray-900\">Special Event Flags</h4>
                <p className=\"text-gray-600 text-sm\">Never miss limited-time events</p>
              </div>
            </div>
            <div className=\"flex items-start space-x-3 p-4 bg-white rounded-lg shadow\">
              <span className=\"text-2xl\">🔄</span>
              <div>
                <h4 className=\"font-bold text-gray-900\">Recurring Events</h4>
                <p className=\"text-gray-600 text-sm\">Weekly activities always listed</p>
              </div>
            </div>
            <div className=\"flex items-start space-x-3 p-4 bg-white rounded-lg shadow\">
              <span className=\"text-2xl\">⚡</span>
              <div>
                <h4 className=\"font-bold text-gray-900\">Quick Updates</h4>
                <p className=\"text-gray-600 text-sm\">Owners can update anytime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className=\"py-16 bg-linear-to-r from-purple-900 to-indigo-900 text-white\">
        <div className=\"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center\">
          <h2 className=\"text-4xl font-bold mb-6\">Ready to Get Your Bar Discovered?</h2>
          <p className=\"text-xl mb-8 text-purple-200\">
            Join BarLink today and reach patrons searching for what you offer
          </p>
          <Link
            href=\"/pricing\"
            className=\"inline-block px-8 py-4 bg-white text-purple-900 rounded-lg font-bold text-lg hover:bg-purple-100 transition shadow-lg\"
          >
            View Pricing
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className=\"bg-gray-900 text-gray-400 py-12\">
        <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8\">
          <div className=\"grid md:grid-cols-4 gap-8\">
            <div>
              <h3 className=\"text-white font-bold text-lg mb-4\">BarLink</h3>
              <p className=\"text-sm\">
                Find bars by activity and day. Never miss what's happening in your area.
              </p>
            </div>
            <div>
              <h4 className=\"text-white font-bold mb-4\">For Patrons</h4>
              <ul className=\"space-y-2 text-sm\">
                <li><Link href=\"/explore\" className=\"hover:text-white transition\">Explore Bars</Link></li>
                <li><Link href=\"/about\" className=\"hover:text-white transition\">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className=\"text-white font-bold mb-4\">For Owners</h4>
              <ul className=\"space-y-2 text-sm\">
                <li><Link href=\"/pricing\" className=\"hover:text-white transition\">Pricing</Link></li>
                <li><Link href=\"/auth/signup\" className=\"hover:text-white transition\">Sign Up</Link></li>
                <li><Link href=\"/auth/signin\" className=\"hover:text-white transition\">Sign In</Link></li>
              </ul>
            </div>
            <div>
              <h4 className=\"text-white font-bold mb-4\">Legal</h4>
              <ul className=\"space-y-2 text-sm\">
                <li><Link href=\"/privacy\" className=\"hover:text-white transition\">Privacy Policy</Link></li>
                <li><Link href=\"/terms\" className=\"hover:text-white transition\">Terms of Service</Link></li>
                <li><Link href=\"/contact\" className=\"hover:text-white transition\">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className=\"border-t border-gray-800 mt-8 pt-8 text-center text-sm\">
            <p>&copy; {new Date().getFullYear()} BarLink. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
' | Out-File -FilePath ".\src\app\page.tsx" -Encoding UTF8

Write-Host "✓ Created HomePage" -ForegroundColor Cyan
