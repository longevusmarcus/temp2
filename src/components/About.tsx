import React from "react";
import Header from "./Header";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      <div className="container mx-auto px-4 pt-28 pb-16">
        <h1 className="text-4xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          About The Million Dollar Vibe Page
        </h1>

        <div className="space-y-8 max-w-3xl">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">
              Our Vision
            </h2>
            <p className="text-gray-300 leading-relaxed">
              The Million Dollar Vibe Page is a creative platform inspired by
              the original Million Dollar Homepage. We've reimagined this
              concept for the modern web development community, creating a space
              where developers can showcase their projects while becoming part
              of a unique digital mosaic.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">
              How It Works
            </h2>
            <p className="text-gray-300 leading-relaxed">
              Vibe coders/entrepreneurs can purchase pixel blocks on our grid,
              each representing a small piece of digital real estate. These
              blocks can be customized with project details, links, and
              branding. As more blocks are purchased, the grid evolves into a
              vibrant showcase of web development talent and creativity.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">
              Our Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold">JD</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Jane Doe</h3>
                <p className="text-gray-400">Founder & Lead Developer</p>
                <p className="mt-3 text-gray-300">
                  Full-stack developer with a passion for creative web projects
                  and community building.
                </p>
              </div>

              <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold">JS</span>
                </div>
                <h3 className="text-xl font-medium mb-2">John Smith</h3>
                <p className="text-gray-400">UX Designer</p>
                <p className="mt-3 text-gray-300">
                  Designer focused on creating intuitive and engaging user
                  experiences for web applications.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-purple-300">
              Contact Us
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Have questions or suggestions? We'd love to hear from you!{" "}
              <a
                href="https://www.themilliondollapage.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 transition-colors"
              >
                Contact us
              </a>{" "}
              on X (Twitter):
            </p>
            <a
              href="https://www.themilliondollapage.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-400 hover:text-purple-300 transition-colors"
            >
              www.themilliondollapage.com
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
