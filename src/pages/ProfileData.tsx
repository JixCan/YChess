import React from 'react';
import '../styles/ProfileCard.css'; // Импортируем CSS

// Типизация данных, которые мы получаем в JSON
interface ProfileData {
  avatarUrl: string;
  bestRating: number;
  bestRatingType: string;
  chessTitle: string;
  isEnabled: boolean;
  countryName: string;
  joinDate: string;
  lastLoginDate: string;
  firstName: string;
  countryId: number;
  onlineStatus: string;
  membership: {
    level: number;
    name: string;
  };
}

const ProfileCard: React.FC<{ profile: ProfileData }> = ({ profile }) => {
  // Функция для перевода типа рейтинга
  const translateRatingType = (type: string) => {
    switch (type) {
      case 'daily': return 'Заочные';
      case 'blitz': return 'Блиц';
      case 'bullet': return 'Пуля';
      case 'rapid': return 'Рапид';
      default: return type;
    }
  };

  return (
    <div className="card">
      <div className="cardContent">
        <div className="avatarSection">
          <img src={profile.avatarUrl} alt="Avatar" className="avatar" />
        </div>

        <div className="infoSection">
          <div className="rating">
            <span className="bestRating">{profile.bestRating}</span>
            <span className="ratingType">{translateRatingType(profile.bestRatingType)}</span>
          </div>
          <div className="title">{profile.chessTitle}</div>
          <div className="dates">
            <div>{`Дата присоединения: ${profile.joinDate}`}</div>
            <div>{`Последний вход: ${profile.lastLoginDate}`}</div>
          </div>
          <div className="country">{profile.countryName}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
