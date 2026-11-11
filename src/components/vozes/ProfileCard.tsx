import { assetUrl } from '../../lib/assetUrl'

type ProfileCardProps = {
  label: string
  name: string
  role: string
  bio: string
  photo: string
}

export function ProfileCard({ label, name, role, bio, photo }: ProfileCardProps) {
  return (
    <div className="profile-card">
      <div className="profile-card-photo-wrap">
        <img className="profile-card-photo" src={assetUrl(photo)} alt="" width={360} height={360} />
      </div>
      <div className="profile-card-body">
        <p className="profile-card-label">{label}</p>
        <p className="profile-card-name">{name}</p>
        <p className="profile-card-role">{role}</p>
        <p className="profile-card-bio">{bio}</p>
      </div>
    </div>
  )
}
