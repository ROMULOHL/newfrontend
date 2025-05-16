// src/hooks/useAutoLogout.js
import { useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../src/firebase';

const useAutoLogout = (timeout = 10 * 60 * 1000) => {
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        signOut(auth);
        alert('Você foi desconectado por inatividade.');
        window.location.href = '/'; // Redireciona para login
      }, timeout);
    };

    const eventos = ['mousemove', 'keydown', 'click', 'scroll'];

    eventos.forEach((evento) => {
      window.addEventListener(evento, resetTimer);
    });

    resetTimer(); // inicia o contador

    return () => {
      eventos.forEach((evento) => {
        window.removeEventListener(evento, resetTimer);
      });
      clearTimeout(timer);
    };
  }, [timeout]);
};

export default useAutoLogout;
