import { useEffect,useState } from 'react';
import { Link } from 'react-router-dom';
import { dataService } from '../../services/dataService';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/ui/Card';
import { StatusBadge } from '../../components/ui/StatusBadge';

export default function DoctorPatients(){
  const {user}=useAuthStore();
  const [patients,setPatients]=useState([]);
  useEffect(()=>{dataService.getPatientsForDoctor(user.id).then(setPatients)},[user.id]);
  return <Card><div className="section-title"><h2>Assigned Patients</h2><div className="filters"><button className="pill active">All</button><button className="pill">High Risk</button><button className="pill">ASD Moderate</button></div></div><div className="grid grid-3">{patients.map(p=><Link to={`/doctor/patients/${p.id}`} className="student-card" key={p.id}><div className="avatar">{p.shortName?.[0]}</div><h3>{p.fullName}</h3><p className="muted">{p.classification} · {p.autismLevel}</p><StatusBadge status={p.status==='stable'?'stable':'warning'}>{p.status.replace('_',' ')}</StatusBadge></Link>)}</div></Card>
}

