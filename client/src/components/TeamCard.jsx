import React from 'react';

// The public profile uses the existing management record returned by the API.
// No names, photos or phone numbers are hardcoded, so admin edits remain authoritative.
export default function TeamCard({person, index = 0, showBio = false}) {
  const phone = String(person.phone ?? '').trim();
  const dialNumber = phone.replace(/(?!^)\+|[^\d+]/g, '');
  const email = String(person.email ?? '').trim();

  return (
    <article className="refresh-team-card refresh-team-card-centered">
      <div className="refresh-team-image">
        {person.photo ? (
          <img src={person.photo} alt={`${person.name} profile photograph`} loading="lazy" />
        ) : (
          <div className="refresh-avatar-placeholder" aria-label="Profile photo not added">
            <span>{String(index + 1).padStart(2, '0')}</span>
          </div>
        )}
      </div>
      <div className="refresh-team-details">
        <h3>{person.name}</h3>
        <p className="refresh-team-role">{person.role}</p>
        {showBio && person.bio && <p className="refresh-team-bio">{person.bio}</p>}
        <div className="refresh-team-contacts">
          {phone && <a href={dialNumber ? `tel:${dialNumber}` : undefined} className="refresh-team-phone" aria-label={`Call ${person.name} at ${phone}`}>
            <span aria-hidden="true">☎</span> {phone}
          </a>}
          {email && <a href={`mailto:${email}`} className="refresh-team-email" aria-label={`Email ${person.name}`}>
            <span aria-hidden="true">✉</span> Email
          </a>}
        </div>
      </div>
    </article>
  );
}
