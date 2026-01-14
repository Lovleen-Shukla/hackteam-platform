import React from 'react';
import { Target, Users, Zap, Rocket, Eye } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-purple-500/30">
      {/* Decorative Background Glows */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      {/* Content Container - pt-32 ensures no overlap with Navbar */}
      <div className="relative z-10 max-w-6xl mx-auto pt-32 pb-20 px-6">
        
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600 bg-clip-text text-transparent animate-gradient">
            About HackSquad
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            HackSquad is a premier platform designed to bridge the gap between talented developers and successful 
            hackathon projects. We believe that the best innovation happens when the right people find each other.
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300">
            <div className="w-12 h-12 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400">
              <Target size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-gray-400 leading-relaxed">
              To streamline the hackathon experience by providing tools for team formation, 
              real-time communication, and peer-to-peer accountability. We empower developers 
              to turn ideas into reality.
            </p>
          </div>

          <div className="bg-slate-800/40 backdrop-blur-md p-8 rounded-3xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
            <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-6 text-blue-400">
              <Eye size={28} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-gray-400 leading-relaxed">
              To become the global standard for collaborative innovation, making it effortless 
              for every creator to find their perfect team and build productive, diverse, 
              and meaningful projects.
            </p>
          </div>
        </div>

        {/* Features Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Users />, title: "Connect", desc: "Find teammates with specific skills like React or AI.", color: "text-purple-400" },
            { icon: <Zap />, title: "Collaborate", desc: "Real-time chat and streamlined project tools.", color: "text-yellow-400" },
            { icon: <Rocket />, title: "Innovate", desc: "Build amazing things together without barriers.", color: "text-pink-400" },
            { icon: <Rocket />, title: "Launch", desc: "Go from idea to production with the right crew.", color: "text-blue-400" }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:bg-slate-800/50 transition-colors text-center group">
              <div className={`${item.color} mb-4 flex justify-center group-hover:scale-110 transition-transform`}>
                {React.cloneElement(item.icon, { size: 32 })}
              </div>
              <h3 className="text-lg font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AboutPage;