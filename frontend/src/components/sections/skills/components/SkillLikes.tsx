// SkillLikes.tsx - Componente para gestionar "likes" de habilidades
import React, { useState } from 'react';
import styles from '../SkillsCard.module.css';

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
    <div className={styles.likesContainer}>
      <button 
        className={`${styles.likesButton} ${hasLiked ? styles.liked : ''}`}
        onClick={handleLike}
        disabled={hasLiked}
        aria-label={hasLiked ? `Ya diste like a esta habilidad (${likes} likes)` : `Dar like a esta habilidad (${likes} likes)`}
        aria-pressed={hasLiked}
        title={hasLiked ? "Ya diste like" : "Dar like"}
      >
        <i className={`fa-${hasLiked ? 'solid' : 'regular'} fa-heart`} aria-hidden="true"></i>
      </button>
      <span className={styles.likesCount} aria-live="polite">{likes}</span>
    </div>
  );
};

export default SkillLikes;