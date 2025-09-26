import { User, MapPin, Github, Linkedin, Twitter, ExternalLink } from "lucide-react"

interface ProfileSidebarProps {
  userData: {
    name: string
    username: string
    role: string
    bio: string
    location: string
    avatar: string
    socialLinks: {
      github: string
      linkedin: string
      twitter: string
    }
  }
  topLanguages: Array<{
    name: string
    percentage: number
    color: string
  }>
}

export function ProfileSidebar({ userData, topLanguages }: ProfileSidebarProps) {
  return (
    <div className="w-80 flex-shrink-0">
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 sticky top-8">
        <div className="text-center mb-8">
          {userData.avatar ? (
            <img
              src={userData.avatar || "/placeholder.svg"}
              alt={userData.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-neutral-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-neutral-100 bg-neutral-100 flex items-center justify-center">
              <span className="text-2xl font-semibold text-neutral-700">{userData.name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <h1 className="text-xl font-semibold text-neutral-900 mb-1">{userData.name}</h1>
          <p className="text-neutral-500 text-sm mb-3">@{userData.username}</p>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700 border border-neutral-200">
            <User className="w-3 h-3 mr-1" />
            {userData.role}
          </span>
        </div>

        {/* Bio */}
        <div className="mb-8">
          <p className="text-neutral-600 text-sm leading-relaxed">{userData.bio}</p>
        </div>

        {/* Location */}
        <div className="mb-8">
          <div className="flex items-center text-neutral-500">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">{userData.location}</span>
          </div>
        </div>

        {/* Social Links */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-neutral-900 mb-4">Connect</h3>
          <div className="space-y-3">
            <a
              href={userData.socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors group"
            >
              <Github className="w-4 h-4 mr-3" />
              <span className="text-sm">GitHub</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href={userData.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors group"
            >
              <Linkedin className="w-4 h-4 mr-3" />
              <span className="text-sm">LinkedIn</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
            <a
              href={userData.socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors group"
            >
              <Twitter className="w-4 h-4 mr-3" />
              <span className="text-sm">Twitter</span>
              <ExternalLink className="w-3 h-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        {/* Top Languages */}
        <div>
          <h3 className="text-sm font-medium text-neutral-900 mb-4">Top Languages</h3>
          <div className="space-y-4">
            {topLanguages.map((language) => (
              <div key={language.name}>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: language.color }}></div>
                    <span className="text-sm text-neutral-700 font-medium">{language.name}</span>
                  </div>
                  <span className="text-xs text-neutral-500">{language.percentage}%</span>
                </div>
                <div className="w-full bg-neutral-100 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${language.percentage}%`,
                      backgroundColor: language.color,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
