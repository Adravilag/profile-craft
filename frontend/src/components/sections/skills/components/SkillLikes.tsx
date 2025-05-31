// SkillLikes.tsx - Componente para gestionar "likes" de habilidades
import React, { useState } from 'react';
import './SkillLikes.css';

type SkillLikesProps = {
  skillId: string;
  initialLikes?: number;
};

const SkillLikes: React.FC<SkillLikesProps> = ({ skillId, initialLikes = 0 }) => {
  const [likes, setLikes] = useState(initialLikes);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(likes + 1);
      setHasLiked(true);
      
      // Aquí podrías añadir lógica para enviar el like al backend
      console.log(`Añadido like a la habilidad: ${skillId}`);
      // saveLikeToDatabase(skillId);
    }
  };

  return (
    <div className="skill-likes">
      <button 
        className={`like-button ${hasLiked ? 'liked' : ''}`}
        onClick={handleLike}
        disabled={hasLiked}
      >
        <i className={`fa-${hasLiked ? 'solid' : 'regular'} fa-heart`}></i>
      </button>
      <span className="likes-count">{likes}</span>
    </div>
  );
};

export default SkillLikes;