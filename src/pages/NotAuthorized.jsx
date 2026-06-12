import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
export default function NotAuthorized(){return <div className="content"><div className="card" style={{maxWidth:560,margin:'80px auto',textAlign:'center'}}><h1>Not authorized</h1><p className="muted">This page is not available for your role.</p><Link to="/login"><Button>Back to login</Button></Link></div></div>}
