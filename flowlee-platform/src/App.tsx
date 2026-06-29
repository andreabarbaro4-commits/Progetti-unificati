import { useState } from 'react';
import './App.css';
import omino from './assets/omino.png';

function App() { 
 const[cielo,setCielo] = useState<number>(1);
 const[stella,setStella] = useState<'azienda|professionista'|null>(null);







  const [companyName, setCompanyName] = useState<string>('');
  const [teamSize, setTeamSize] = useState<string>('30-50');
  const [description, setDescription] = useState<string>(
  )

const handleSelectType = (type: 'azienda| professionista') => {
     setStella(type)

     setCielo(2)
}
   

  return (
    <div className = "appwrapper" >
      
     
      <div className={`blob-bg ${cielo === 2 ? 'step-2-active' : ''}`}></div>

      <main className="app-container">
        
        {cielo === 1 && (
          <section className="card-layout step-one animate-fade-in">
            <header className="card-header">
              <span className="breadcrumb">Organizzazione/con chi lavori? </span>
              <div className="brand-header">
                <span className="brand-cielo">Flowlee</span>
              </div>
              <span className="user-profile">Andrea ::</span>
            </header>

            <div className="Uno">
              <div className="Due">
                <h1 className="main-title">
                  Iniziamo dalle basi. <br />
                  Lavori con un'azienda<br />
                  o sei un freelance?
                 
                </h1>
                  
               


                  
              
             
              
                
                <div className = "cielo">
                  <header className = "stella">
                    Abbiamo soluzioni diverse per te.
                    </header>
                    </div>
                 
                


                  <br />
                  

                 
                {/* Contenitore dei bottoni */}
                <div className="ciao">
                  <button className="btn btn-dark" onClick={() => handleSelectType('Azienda')}>
                   Azienda
                  </button>
                  <button className="btn btn-light" onClick={() => handleSelectType('professionista')}>
                    Lavoro da solo
                  </button>
                </div>
                </div>

               
                
        


              

             
                 <div className="content-right">
                <div className="hero-image-wrapper">
                  <img src = {omino} className="hero-image" />
                </div>
              </div>
            </div>
          </section>
        )}

        {cielo === 2 && (
          <section className="card-layout step-two animate-fade-in">
            <header className="card-header">
              <span className="breadcrumb">Organizzazione /Dettagli </span>
              <div className="brand-header">
                <span className="brand-text">Flowlee</span>
              </div>
              <span className="user-profile">Andrea ::</span>
            </header>
            


            <div className="card-body form-split">
          
              <div className="Tre">
                
                <div className="4">
                  <svg className="company-logo" width="120" height="50">
                    <use href="/icons.svg#icons" /> 
                  </svg>
                  <span className="logo-subtext">
                    {stella === 'Azienda' ? 'Azienda' : 'PROFESSIONISTA'}
                  </span>
                </div>
              </div>

              {/* Form Input a Destra */}
              <div className="form-container-box">
                <form onSubmit={(e) => e.preventDefault()} className="flowlee-form">
                  
                  <div className="form-group">
                    <label htmlFor="companyName">
                      {stella=== 'Azienda' ? "Nome dell'azienda" : "Nome e cognome"}
                    </label>
                    <input 
                      type="text" 
                      id="companyName" 
                      value={companyName} 
                      onChange={(e) => setCompanyName(e.target.value)} 
                    />
                  </div>

                  {/* Mostra la dimensione del team solo se è un'azienda */}
                  {stella === 'Azienda' && (
                    <div className="form-group">
                      <label htmlFor="teamSize">Numero dipendenti</label>
                      <div className="select-wrapper">
                        <select 
                          id="teamSize" 
                          value={teamSize} 
                          onChange={(e) => setTeamSize(e.target.value)}
                        >
                          <option value="1-10">1-10 persone</option>
                          <option value="11-30">11-30 persone</option>
                          <option value="30-50">30-55s persone</option>
                          
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <label htmlFor="description">Di cosa ti occupi??</label>
                    <textarea 
                      id="description"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </div>

                  
                  <div className="form-actions">
                    <button type="button" className="btn btn-light" onClick={() => setCielo(1)}>
                      Torna Indietro
                    </button>
                    <button type="submit" className="btn btn-dark">
                      Salva e Continua
                    </button>
                  </div>



                

                  

                </form>
              </div>
            </div>
          </section>
        )}


        
      </main>
    </div>
  );
}

export default App;