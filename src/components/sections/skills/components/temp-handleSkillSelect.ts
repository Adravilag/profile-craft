// Este es un archivo temporal para editar individualmente la función handleSkillSelect

// Manejar selección de skill
const handleSkillSelect = (skill: any, e?: React.MouseEvent) => {
  // Detener la propagación del evento para evitar que llegue al overlay del modal
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  
  // Validar que el skill tenga un nombre no vacío
  if (!skill || !skill.name || skill.name.trim() === '') {
    console.error('Se intentó seleccionar una habilidad sin nombre');
    return;
  }
  
  // Para asegurar que tanto el state interno como el formData se actualicen
  const event = {
    target: { 
      name: 'name', 
      value: skill.name,
      id: 'skill-name',
      type: 'text'
    }
  } as React.ChangeEvent<HTMLInputElement>;
  
  // Actualiza el formData del padre
  onFormChange(event);
  
  // Actualiza el estado interno
  setSearchText(skill.name);
  
  // Cierra el dropdown
  setIsDropdownOpen(false);
  
  // Asegurarse de que el input refleje el cambio
  if (inputRef.current) {
    inputRef.current.value = skill.name;
  }
  
  // Verificar después de un breve delay que todo se haya actualizado correctamente
  console.log('Skill seleccionada:', skill.name);
  
  // También forzar un cambio directo en el input del DOM y disparar el evento change
  setTimeout(() => {
    if (inputRef.current) {
      // Asegurarse que el valor esté establecido
      inputRef.current.value = skill.name;
      
      // Crear y disparar un evento nativo para React
      const nativeEvent = new Event('input', { bubbles: true });
      inputRef.current.dispatchEvent(nativeEvent);
      
      // También llamar directamente a onFormChange de nuevo para asegurarse
      const syntheticEvent = {
        target: inputRef.current
      } as React.ChangeEvent<HTMLInputElement>;
      onFormChange(syntheticEvent);
    }
  }, 0);
};
