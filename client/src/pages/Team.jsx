import React,{useEffect,useState} from 'react';
import Seo from '../components/Seo';
import {api} from '../api';
import TeamCard from '../components/TeamCard';

export default function Team(){
  const [team,setTeam]=useState([]);
  useEffect(()=>{api.management().then(setTeam).catch(()=>{})},[]);
  return <>
    <Seo title="Creative & Management Team | Darwich Consultancy" description="Meet the people behind Darwich Consultancy." canonical="https://darwichconsultancy.com/team"/>
    <section className="refresh-page-head">
      <div className="container narrow">
        <p className="eyebrow">OUR PEOPLE</p>
        <h1>The people behind<br/><em>the possibilities.</em></h1>
        <p className="lead">Meet our team and get in touch directly.</p>
      </div>
    </section>
    <section className="section refresh-section">
      <div className="container">
        <div className="refresh-team-grid">
          {team.map((person,index)=><TeamCard key={person.id} person={person} index={index} showBio />)}
        </div>
      </div>
    </section>
  </>;
}
