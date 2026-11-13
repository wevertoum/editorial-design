import { assetUrl } from '../../lib/assetUrl'
import { registerProfileName, useProfileGovernanceHighlight } from '../../lib/profileGovernanceHighlight'

/** Bump when portrait PNGs change — evita cache de foto natural na prévia Vivliostyle. */
const PROFILE_PHOTO_CACHE = 'duotone-v2'

type ProfileCardProps = {
  name: string
  role: string
  bio: string
  photo: string
  className?: string
}

export function ProfileCard({ name, role, bio, photo, className }: ProfileCardProps) {
  const highlightStore = useProfileGovernanceHighlight()
  registerProfileName(highlightStore, name)
  const extra = className?.trim() ? ` ${className.trim()}` : ''

  return (
    <div className={`profile-card${extra}`} lang="pt-BR">
      <div className="profile-card-photo-wrap">
        <img
          className="profile-card-photo"
          src={`${assetUrl(photo)}?v=${PROFILE_PHOTO_CACHE}`}
          alt={name}
          width={360}
          height={360}
        />
      </div>
      <div className="profile-card-body">
        <p className="profile-card-name">{name}</p>
        <p className="profile-card-role">{role}</p>
        <p className="profile-card-bio">{bio}</p>
      </div>
    </div>
  )
}
