import { useState } from 'react';
import './App.css';

import avatar from './assets/avatar.png';
import avatar3 from './assets/avatar3.png';
import profilo from './assets/profilo.png';
import { FaSearch } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { BsGrid3X3Gap } from "react-icons/bs";
import logoImage from './assets/Logo.png'
import omino from './assets/omino.png'

const ruoli = [
  "Project Manager",
  "Ux Designer",
  "UI Designer",
  "Hr Manager",
  "Troll",
  "Data Analyst",
  "Dog Sitter",
 
]


function App() {
  const [dato, setDato] = useState(1);
  const [ruoloSelezionato, setRuoloSelezionato] = useState(null);
  const poi = [
    "Proiect manager", 
    "Hr Manager", 
    "Dog Sitter"

  ]


const onSelectType = (type:string) : void => { 
   console.log(type);
}
  
const onBack = () => {
  setDato((prev) => Math.max(prev-1,1))
}


  return (
    <div className="App">
      
      {/* Step 1 */}
      {dato === 1 && (
        <div className = "container-sfondo">
        <div className="Step">
          <div className="logo">Flowlee</div>
          <h1>Benvenuto!<br />Raccontaci chi sei.</h1>
          <div className="input-group">
            <label>Nome</label>
            <input type="text" placeholder="Nome" />
          </div>
          <div className="input-group">
            <label>Cognome</label>
            <input type="text" placeholder="Cognome" />
          </div>
          <div className="input-group">
            <label>Genere</label>
            <select>
              <option>Maschile</option>
              <option>Femminile</option>
            </select>
          </div>
          <div className="input-group">
            <label>Data di nascita</label>
            <input type="text" placeholder="01/01/1999" />
          </div>
          <button className = "de" onClick = {() => setDato(2)}>
            successivo
          </button>

        
          </div>
          </div>
      )}

      {/* Step 2 */}
      {dato === 2 && (
        <div className = "container-sfondo">
        <div className="Step">
          <div className="logo">Flowlee</div>
          <h1>Ciao Marco!<br />Creiamo l'account.</h1>
          <div className="input-group">
            <label>Email</label>
            <input type="email" placeholder="Email" />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input type="password" placeholder="Password" />
          </div>
          <div className="input-group">
            <label>Conferma password</label>
            <input type="password" placeholder="Conferma password" />
          </div>
          <button className="de" onClick={() => setDato(3)}>
            Successivo
            </button>

            
        </div>
        </div>
      )}

      {/* Step 3 */}
      {dato === 3 && (
        <div className = "container-sfondo">
        <div className="Step">
          <div className="logo">Flowlee</div>
          <img src={avatar} alt="avatar" className="avatar" />
          <h1>Sto inviando<br />il codice di verifica.</h1>
          <button className="de" onClick={() => setDato(4)}>Successivo</button>
        </div>
        </div>
      )}

      {/* Step 4 */} 
      {dato === 4 && (
        <div className = "container-sfondo">
        <div className="Step">
          <div className="logo">Flowlee</div>
          <h1>Inserisci il codice<br />che trovi sulla mail!</h1>
          <p style={{marginBottom: '20px', color: '#666', fontSize: '14px'}}>mariorossi@gmail.com</p>
          <div className="input-group">
            <label>Codice</label>
            <input type="text" placeholder="Inserisci codice"/>
          </div>
          <button className="WE">Invia di nuovo</button>
          <button className="era" onClick={() => setDato(5)}>Conferma</button>
        </div>
        </div>
      )}

      {/* Step 5 */}
      {dato === 5 && (
        <div className="Step">
          <img src={avatar3} alt="avatar3" className="avatar3" />
          <div>
            <h1>Piacere Flowlee! <br />Benvenuto. Creiamo il tuo profilo?</h1>
          </div>
          <div className="hey">
            <button className="wr" onClick={() => setDato(6)}>Crea profilo</button>

           
          </div>
        </div>

        
      )}

      {/* Step 6 */}
      {dato === 6 && (
        <div className = "container-sfondo">
        <div className="Step step-header-layout">
          <div className="top-navigation">
            <div className="arrows-container">
              <IoIosArrowDown className="top-icon" />
              <IoIosArrowUp className="top-icon" />
            </div>
            <div className="logo-center">Flowlee</div>
            <div className="right-icons">
              <BsGrid3X3Gap className="top-icon" />
              <HiOutlineUserCircle className="top-icon" />
            </div>
          </div>


          <h1>Benvenuto!<br />Raccontaci chi sei</h1>

          <div className="search-container">
            <span className="search-icon"><FaSearch /></span>
            <input type="text" placeholder="Cerca un ruolo" className="search-input" />
          </div>

          <div className="ruoli-container">
            {ruoli.map((ruolo) => (
              <button 
                key={ruolo} 
                type="button" 
                className={`ruolo-tag ${ruoloSelezionato === ruolo ? 'active' : ''}`}
                onClick={() => setRuoloSelezionato(ruolo)}
              >
                {ruolo}
              </button>
            ))}
          </div>

          <button 
            className="procedi-btn" 
            disabled={!ruoloSelezionato}
            onClick={() => setDato(7)}>
            Procedi
          </button>
        </div>
        </div>
      )}

   


      {/* Step 7 */}
      {dato === 7 && (
        <div className = "container-sfondo">
        <div className="Step step-header-layout">
          <div className="top-navigation">
            <div className="nav-left">
              <div className="arrows-container">
                <IoIosArrowDown className="top-icon" />
                <IoIosArrowUp className="top-icon" />
              </div>
              <div className="profilo-lavoro-container">
                <span>Profilo/Lavoro</span>
              </div>
            </div>

            <div className="nav-center">
              Flowlee
            </div>
         
            <div className="right-icons">
              <BsGrid3X3Gap className="top-icon" />
              <HiOutlineUserCircle className="top-icon" />
            </div>
          </div>
          
          <h1>Che lavoro fai?</h1>
          
          <div className="search-container">
            <span className="search-icon"><FaSearch /></span>
            <input type="text" placeholder="Cerca un ruolo" className="search-input" />
          </div>

          <div className="ruoli-container">
            {ruoli.map((ruolo) => (
              <button 
                key={ruolo} 
                type="button" 
                className={`ruolo-tag ${ruoloSelezionato === ruolo ? 'active' : ''}`}
                onClick={() => setRuoloSelezionato(ruolo)}
              >
                {ruolo}
              </button>
            ))}
          </div>

          
          <img 
            src={avatar3}
            alt="avatar" 
            className="avatar-decorativo" 
          />

          <button className="tr" onClick={() => setDato(8)}>
            Procedi
          </button>
        </div>
        </div>
      )}

      {/* Step 8 */}
      {dato === 8 && (
        <div className = "container-sfondo">
        <div className="Step step-header-layout">
          <div className="top-navigation">
            <div className="nav-left">
              <div className="arrows-container">
                <IoIosArrowDown className="top-icon" />
                <IoIosArrowUp className="top-icon" />
              </div>
              <div className="profilo-lavoro-container">
                <span>Profilo/Lavoro</span>
              </div>
            </div>

            <div className="nav-center">
              Flowlee
            </div>
         
            <div className="right-icons">
              <BsGrid3X3Gap className="top-icon" />
              <HiOutlineUserCircle className="top-icon" />
            </div>
          </div>

          <div className="we">
            <h1>Carica una foto!</h1>

            <div className="profile-upload-container">
              <div className="profile-circle">
                <span>+</span>
              </div>
            </div>

            <div className="nome">
              <h1>Mario Rossi</h1>
              <span className="VE">@mariorossi@gmail.com</span>
            </div>

            <div className="button-container">
              {poi.map((sole, index) => (
                <button key={index} type="button" className="step">
                  {sole}
                </button>
              ))}
            </div>
            <img 
            src={avatar3}
            alt="avatar" 
            className="avatar-decorativo" 
          />


            <div className="rt">
            <button className = "qa btn-bianco" onClick = {() => setDato(9)}>
             Inizia
            </button>
           


            </div>
          </div>
        </div>
        </div>
      )}

      {/* Step 9 */}
      {dato === 9 && (
         <div className = "container-sfondo">
        <div className="Step step-header-layout">
          <div className="top-navigation">
            <div className="nav-left">
              <div className="arrows-container">
                <IoIosArrowDown className="top-icon" />
                <IoIosArrowUp className="top-icon" />
              </div>
              <div className="profilo-lavoro-container">
                <span>Profilo/Lavoro</span>
              </div>
            </div>

            <div className="nav-center">
              Flowlee
            </div>
         
            <div className="right-icons">
              <BsGrid3X3Gap className="top-icon" />
              <HiOutlineUserCircle className="top-icon" />
            </div>
          </div>

          <div className="we">
            <h1>Carica una foto!</h1>

           <div className="profile-upload-container">
        <div className="profile-circle">
          
          <img src={profilo} alt="Profilo" className="profile-img" />
        </div>
      </div>
            <div className="nome">
              <h1>Mario Rossi</h1>
              <span className="VE">@mariorossi@gmail.com</span>
            </div>

            <div className="button-container">
              {poi.map((sole, index) => (
                <button key={index} type="button" className="step">
                  {sole}
                </button>
              ))}
            </div>
            <img 
            src={avatar3}
            alt="avatar" 
            className="avatar-decorativo" 
          />


            <div className="rt">
            <button className = "qa" onClick = {() => setDato(10)}>
             Inizia
            </button>
           


            </div>
          </div>
        </div>
        </div>
      )}


{dato === 10 && (
        <div className="container-sfondo">
          <div className="Step step-header-layout step10-layout">
            <div className="top-navigation">
              <div className="nav-left">
                <div className="arrows-container">
                  <IoIosArrowDown className="top-icon" />
                  <IoIosArrowUp className="top-icon" />
                </div>
                <div className="profilo-lavoro-container">
                  <span>Organizzazione</span>
                </div>
              </div>
              <div className="nav-center">
                <img src={logoImage} alt="Flowlee" style={{ height: "20px", width: "auto" }} />
              </div>
              <div className="right-icons">
                <BsGrid3X3Gap className="top-icon" />
                <HiOutlineUserCircle className="top-icon" />
              </div>
            </div>

            <div className="step10-content">
              <div className="step10-left">
                <h1 className="section-title">
                  Iniziamo dalle basi.<br />
                  Lavori con un'azienda<br />
                  o sei un freelance?
                </h1>
                <p className="step10-subtitle">Abbiamo soluzioni diverse per te.</p>
                <div className="step10-buttons">
                  <button  className  = "dark" onClick={() => setDato(11)}>Company</button>
                  <button className = "light" onClick={() => onSelectType("Freelance")}>Freelance</button>
                </div>
              </div>
              <div className="step10-right">
                <img src={omino} alt="Flowlee" className="step10-image" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 11 */}
      {dato === 11 && (
        <div className= "container-sfondo sfondo-scuro">
          <div className="Step step-header-layout step10-layout">
            <div className="top-navigation">
              <div className="nav-left">
                <div className="arrows-container" onClick={onBack} style={{ cursor: 'pointer' }}>
                  <IoIosArrowDown className="top-icon" />
                  <IoIosArrowUp className="top-icon" />
                </div>
                <div className="profilo-lavoro-container">
                  <span>Organizzazione / Dettagli azienda</span>
                </div>
              </div>
              <div className="nav-center">
                <img src={logoImage} alt="Flowlee" style={{ height: "20px", width: "auto" }} />
              </div>
              <div className="right-icons">
                <BsGrid3X3Gap className="top-icon" />
                <HiOutlineUserCircle className="top-icon" />
              </div>
            </div>

            <div className="step10-content" style={{ display: 'flex', gap: '40px', alignItems: 'center', justifyContent: 'center' }}>
              <div className="step10-right" style={{ flex: '1', maxWidth: '300px' }}>
                <div className="w-full aspect-square border border-black flex flex-col items-center justify-center bg-white shadow-sm">
                  <span className="font-bold text-gray-800 text-lg">LOGO</span>
                </div>
              </div>
              <div className="step10-left" style={{ flex: '1', maxWidth: '400px' }}>
                <div className="space-y-4">
                  <div>
                    <label className="rv">Nome dell'azienda</label> <br />
                    <input type = "text" className = "li"  placeholder = "Company srl"/>
                  </div>
                  <div>
                    <label className="gv">Grandezza team</label> <br />
                     <select className = "nnnn">
                      <option>1-5 persone  29/mese </option>  
                      <option>6-10 persone 49/mese</option>
                      <option>11-29 persone 60/mese</option>
                      </select>
                      <div className="justify-center">
                       
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="b">Descrizione</label> <br />
                    <input type = "text" className = "li2"  placeholder = "Descrizione"/>
                      <button className = "jj" onClick = {() => setDato(12)}>
                        Procedi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
       
        
      )}

{dato === 12 && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: '#000',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  }}>
    {/* SFONDO SFUMATO (Sostituito per maggiore brillantezza) */}
    <div style={{
  position: 'absolute',
  width: '1000px',
  height: '1000px',
  
  background: `
    radial-gradient(circle at 40% 50%, rgba(255, 120, 130, 1.3) 0%, transparent 50%),
    radial-gradient(circle at 60% 50%, rgba(100, 90, 200, 0.8) 0%, transparent 50%)
  `,
  // 3. Aumenta il blur per "ammorbidire" la luce
  filter: 'blur(120px)',
  // 4. Fondamentale: usa 'screen' per sovrapporre il colore come luce
  mixBlendMode: 'screen',
  opacity: 1,
  pointerEvents: 'none',
  zIndex: 0
}} />
  

    

    {/* CONTENITORE MODALE */}
    <div style={{
  position: 'relative',
  zIndex: 1,
  
  // AGGIUNGI O MODIFICA QUESTE RIGHE:
  backgroundColor: 'rgba(255, 255, 255, 0.75)', 
  backdropFilter: 'blur(20px)',                
  border: '1px solid rgba(255, 255, 255, 0.3)', 
  
  padding: '40px',
  borderRadius: '24px',
  width: '850px',
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px'
}}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', margin: 0 }}>Impostazioni azienda</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '220px 180px 1fr', gap: '40px' }}>
        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button style={{ backgroundColor: '#000', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}>Dettagli dell'azienda</button>
          <button style={{ backgroundColor: 'transparent', border: '1px solid #e5e5e5', padding: '12px', borderRadius: '10px', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}>Modifica amministratori</button>
          <button style={{ backgroundColor: 'transparent', border: '1px solid #e5e5e5', padding: '12px', borderRadius: '10px', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}>Contatti aziendali</button>
          <button style={{ backgroundColor: 'transparent', border: '1px solid #e5e5e5', padding: '12px', borderRadius: '10px', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}>Fatturazione e pagamento</button>
          <button style={{ backgroundColor: 'transparent', border: '1px solid #e5e5e5', padding: '12px', borderRadius: '10px', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}>Modello e orario di lavoro</button>
        </div>

        {/* Logo box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <span style={{ fontSize: '12px', fontWeight: '600', color: '#000' }}>Logo</span>
          <div style={{ width: '180px', height: '180px', border: '1px solid #e5e5e5', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fafafa' }}>
            <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#ccc' }}>LOGO</span>
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ color: 'black', fontSize: '13px', marginBottom: '4px', display: 'block' }}>Nome dell'azienda</label>
            <input style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e5e5', boxSizing: 'border-box' }} placeholder="Company Srl" />
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', marginBottom: '4px', display: 'block', color: 'black' }}>Grandezza team</label>
              <select style={{ width: '100%', height: '46px', padding: '0 12px', borderRadius: '10px', border: '1px solid #e5e5e5', boxSizing: 'border-box' }}>
                <option>30-50 persone</option>
              </select>
            </div>
            <div style={{ width: '120px', height: '46px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e5e5', borderRadius: '10px', backgroundColor: '#f9f9f9', fontSize: '13px', boxSizing: 'border-box' }}>
              €200/mese
            </div>
          </div>
          
          <div>
            <label style={{ color: 'black', fontSize: '13px', marginBottom: '4px', display: 'block' }}>Descrizione</label>
            <input type="text" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #e5e5e5', boxSizing: 'border-box' }} placeholder="Company Srl" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button style={{ backgroundColor: '#000', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => setDato(13)}>Salva</button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


{dato === 13 && (
   <div className = "container-sfondo">
        <div className="Step wide-mode">
          <div className="top-navigation">
            <div className="nav-left">
              <div className="arrows-container">
                <IoIosArrowDown className="top-icon" />
                <IoIosArrowUp className="top-icon" />
              </div>
              <div className="profilo-lavoro-container">
                <span>Organizzazione/ruolo</span>
              </div>
            </div>

            <div className="nav-center">
              Flowlee
            </div>
         
            <div className="right-icons">
              <BsGrid3X3Gap className="top-icon" />
              <HiOutlineUserCircle className="top-icon" />
            </div>
          </div>


          <div className = "er">
            <h1> Che ruolo occupi <br />
                nell'organizzazione <br />
                che stai creando?
                </h1>
          </div>
          
          
          <div className = "zr">
          <label>Creatore</label> <br />
          <input className = "rew" type = "text"  placeholder = "Andrea Barbaro"/>
          </div>


         <div className="kk">
  <label>Ruolo</label> <br />
   <select className="rew">
    <option>Seleziona un ruolo</option>
    <option value="creatore">Creatore</option>
    <option value="secondo_ordine">Di secondo ordine</option>
  </select>
</div>


         <button className = "bv" onClick = {() => setDato(14)}>
          Procedi
         </button>
            
          </div>

          </div>
         
          
          
)}
                





       
       
            
            

           
              
      
      

    
      
      


      
    </div>
  );
}

export default App;