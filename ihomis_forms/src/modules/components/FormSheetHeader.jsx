import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import './FormSheetHeader.css';

function SealPlaceholder({ label }) {
  return (
    <div className="form-sheet-header__seal" aria-hidden="true">
      {label}
    </div>
  );
}

export default function FormSheetHeader({
  leftLogoSrc,
  rightLogoSrc,
  leftLogoPath = import.meta.env.VITE_SUPABASE_LEFT_LOGO_PATH || '',
  rightLogoPath = import.meta.env.VITE_SUPABASE_RIGHT_LOGO_PATH || '',
  leftLogoAlt = 'Left agency seal',
  rightLogoAlt = 'Right agency seal',
  country = 'Republic of the Philippines',
  office = 'Provincial Health Office',
  hospital = 'AGUSAN DEL NORTE PROVINCIAL HOSPITAL',
  address = 'VILLAGE II, BRGY. LIBERTAD, BUTUAN CITY (Capital) AGUSAN DEL NORTE CARAGA',
  contactNo = '085 817-3390',
}) {
  const [leftStorageUrl, setLeftStorageUrl] = useState('');
  const [rightStorageUrl, setRightStorageUrl] = useState('');

  const logoBucket = import.meta.env.VITE_SUPABASE_LOGO_BUCKET || '';
  const useSignedUrl = useMemo(
    () => String(import.meta.env.VITE_SUPABASE_LOGO_USE_SIGNED_URL || '').toLowerCase() === 'true',
    []
  );

  useEffect(() => {
    let isMounted = true;

    const loadLogoUrls = async () => {
      if (!supabase || !logoBucket) {
        return;
      }

      const canLoadImage = (url) => new Promise((resolve) => {
        if (!url) {
          resolve(false);
          return;
        }

        const image = new Image();
        image.onload = () => resolve(true);
        image.onerror = () => resolve(false);
        image.src = url;
      });

      const getStorageUrl = async (path) => {
        if (!path) return '';

        if (useSignedUrl) {
          const { data, error } = await supabase.storage
            .from(logoBucket)
            .createSignedUrl(path, 60 * 60);

          if (error) {
            console.warn('Unable to create signed logo URL from Supabase Storage.', error.message);
            return '';
          }

          const signedUrl = data?.signedUrl || '';
          return (await canLoadImage(signedUrl)) ? signedUrl : '';
        }

        const { data } = supabase.storage.from(logoBucket).getPublicUrl(path);
        const publicUrl = data?.publicUrl || '';
        return (await canLoadImage(publicUrl)) ? publicUrl : '';
      };

      const [resolvedLeft, resolvedRight] = await Promise.all([
        leftLogoSrc ? '' : getStorageUrl(leftLogoPath),
        rightLogoSrc ? '' : getStorageUrl(rightLogoPath),
      ]);

      if (!isMounted) return;

      setLeftStorageUrl(resolvedLeft || '');
      setRightStorageUrl(resolvedRight || '');
    };

    loadLogoUrls();

    return () => {
      isMounted = false;
    };
  }, [leftLogoSrc, rightLogoSrc, leftLogoPath, rightLogoPath, logoBucket, useSignedUrl]);

  const resolvedLeftLogoSrc = leftLogoSrc || leftStorageUrl;
  const resolvedRightLogoSrc = rightLogoSrc || rightStorageUrl;

  return (
    <header className="form-sheet-header" role="banner">
      <div className="form-sheet-header__top-row">
        <div className="form-sheet-header__logo-wrap">
          {resolvedLeftLogoSrc ? (
            <img src={resolvedLeftLogoSrc} alt={leftLogoAlt} className="form-sheet-header__logo" />
          ) : (
            <SealPlaceholder label="OFFICIAL SEAL" />
          )}
        </div>

        <div className="form-sheet-header__center">
          <p className="form-sheet-header__line form-sheet-header__line--regular">{country}</p>
          <p className="form-sheet-header__line form-sheet-header__line--bold">{office}</p>
          <p className="form-sheet-header__line form-sheet-header__line--hospital">{hospital}</p>
          <p className="form-sheet-header__line form-sheet-header__line--italic">{address}</p>
          <p className="form-sheet-header__line form-sheet-header__line--small">Contact No: {contactNo}</p>
        </div>

        <div className="form-sheet-header__logo-wrap">
          {resolvedRightLogoSrc ? (
            <img src={resolvedRightLogoSrc} alt={rightLogoAlt} className="form-sheet-header__logo" />
          ) : (
            <SealPlaceholder label="HOSPITAL SEAL" />
          )}
        </div>
      </div>

    </header>
  );
}
