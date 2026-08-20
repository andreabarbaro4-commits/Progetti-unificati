import { useState } from 'react';
import './App.css';
import { useTranslation } from 'react-i18next';
import avatar from './assets/avatar.png';
import avatar3 from './assets/avatar3.png';
import profilo from './assets/profilo.png';
import { FaSearch } from "react-icons/fa";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { BsGrid3X3Gap } from "react-icons/bs";
import logoImage from './assets/Logo.png'
import omino from './assets/omino.png'
import violetto from './assets/violetto.png'
import Settings from './assets/Settings.png'
import rettangolo from "./assets/faccia.png"
import logo from "./assets/Logo.png"
import ellissi from "./assets/ellissi.png"
import barra from "./assets/barra.png"
import group from "./assets/group.png"
import icona from "./assets/Icon.png"

const ruoli = [
  "Project Manager",
  "Ux Designer",
  "UI Designer",
  "Hr Manager",
  "UI/UX",
  "Data Analyst",
  "Dog Sitter",
  "Social media",
  "Fotografo"
 
]
const titoli = [
  "Dettagli azienda",
  " Modifica amministratori",
  "Contatti aziendali",
  "Fatturazione e pagamento",
  "Modello e orario di lavoro"



]


function App() {
  const { t ,i18n} = useTranslation<string>();
  const [selezionati, setSelected] = useState({});
  const [dato, setDato] = useState(1);
  const [ruoloSelezionato, setRuoloSelezionato] = useState(null);
  const[Stella,setStella] = useState(null);
  const poi = [
    "Proiect manager", 
    "Hr Manager", 
    "Dog Sitter"

  ]

const modificaOrario = (chiave, operazione) => {
  setOrari(prev => {
    let valoreAttuale = prev[chiave];
    if (operazione === '+') {
      valoreAttuale = valoreAttuale < 23 ? valoreAttuale + 1 : 0;
    } else {
      valoreAttuale = valoreAttuale > 0 ? valoreAttuale - 1 : 23;
    }
    return { ...prev, [chiave]: valoreAttuale };
  });
};
const onSelectType = (type:string) : void => { 
   console.log(type);
}
   const [orari, setOrari] = useState({
 flessibileDalle: 12,
  flessibileAlle: 15,
  fissaDalle: 13,
   fissaAlle: 14,
   })
const onBack = () => {
  setDato((prev) => Math.max(prev-1,1))
}
const giorni = ['L', 'M', 'M', 'G', 'V', 'S', 'D'];

  return (
    <div className="App">
      
   {/* STEP 1 */}
 {/* STEP 1 */}
{dato === 1 && (
  <div className="container-sfondo">
    <div className="Step">
      
      {/* Bottoni lingua posizionati in alto, dentro lo Step ma senza alterare il flusso */}
      <div className="language-container" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button onClick={() => i18n.changeLanguage('it')}>IT</button>
        <button onClick={() => i18n.changeLanguage('en')} style={{ marginLeft: '5px' }}>EN</button>
      </div>

      <div className="logo">
        <img 
          src={logoImage} 
          alt="Flowlee" 
          style={{ 
            width: 'auto',      // Mantiene le proporzioni
            height: '20px',     // Fissa l'altezza (o usa max-height per sicurezza)
            display: 'block',
            margin: '0 auto'    // Centra il logo
          }} 
        />
      </div>
      <h1>{t('welcome')}<br />{t('tell_us_who_you_are')}</h1>
      
      {/* Contenitore form con spazio ravvicinato */}
      <div className="form-content">
        <div className="input-group" style={{ marginBottom: '10px' }}>
          <label>{t('name')}</label>
          <input type="text" placeholder={t('name')} />
        </div>
        
        <div className="input-group" style={{ marginBottom: '10px' }}>
          <label>{t('surname')}</label>
          <input type="text" placeholder={t('surname')} />
        </div>
        
        <div className="input-group" style={{ marginBottom: '10px' }}>
          <label>{t('gender')}</label>
          <select>
            <option>{t('male')}</option>
            <option>{t('female')}</option>
          </select>
        </div>

        {/* Nuovo campo: Data di Nascita */}
        <div className="input-group" style={{ marginBottom: '10px' }}>
          <label>{t('birth_date')}</label>
          <input type="date" />
        </div>
      </div>

      {/* Il bottone resta in fondo */}
      <button className="de" onClick={() => setDato(2)}>
        {t('next')}
      </button>
      
    </div>
  </div>
)}

      {/* Step 2 */}
{/* Step 2 */}
{dato === 2 && (
  <div className="container-sfondo">
    <div className="Step" style={{ minHeight: '650px', padding: '40px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      <div>
        <div className="language-container" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button onClick={() => i18n.changeLanguage('it')}>IT</button>
          <button onClick={() => i18n.changeLanguage('en')} style={{ marginLeft: '5px' }}>EN</button>
        </div>
        
        <div className="logo">
          <img 
            src={logoImage} 
            alt="Flowlee" 
            style={{ 
              width: 'auto',      
              height: '20px',     
              display: 'block',
              margin: '0 auto'    
            }} 
          />
        </div>
        
        <h1 style={{ marginTop: '20px', marginBottom: '25px' }}>{t('hello_marco')}<br />{t('create_account')}</h1>
     
        {/* Contenitore form con campi ravvicinati */}
        <div className="form-content">
          <div className="input-group" style={{ marginBottom: '10px' }}>
            <label>Email</label>
            <input type="email" placeholder="Email" />
          </div>
          
          <div className="input-group" style={{ marginBottom: '10px' }}>
            <label>{t('password')}</label>
            <input type="password" placeholder={t('password')} />
          </div>
          
          <div className="input-group" style={{ marginBottom: '10px' }}>
            <label>{t('confirm_password')}</label>
            <input type="password" placeholder={t('confirm_password')} />
          </div>
        </div>
      </div>

      <button className="de" onClick={() => setDato(3)} style={{ marginTop: '20px' }}>
        {t('next')}
      </button>
        
    </div>
  </div>
)}
      {/* Step 3 */}
      {dato === 3 && (
        <div className = "container-sfondo">
        <div className="Step">
              <div className="logo">
  <img 
    src={logoImage} 
    alt="Flowlee" 
    style={{ 
      width: 'auto',      // Mantiene le proporzioni
      height: '20px',     // Fissa l'altezza (o usa max-height per sicurezza)
      display: 'block',
      margin: '0 auto'    // Centra il logo
    }} 
  />
</div>
          <img src={avatar} alt="avatar" className="avatar" />
          <h1>Sto inviando<br />il codice di verifica.</h1>
          <button className="de punti" onClick={() => setDato(4)}>Successivo</button>
        </div>
        </div>
      )}

  {dato === 4 && (
  <div className="container-sfondo">
    <div className="Step" style={{ minHeight: '650px', padding: '40px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      
      <div>
        <div className="logo">
          <img 
            src={logoImage} 
            alt="Flowlee" 
            style={{ 
              width: 'auto',      
              height: '20px',     
              display: 'block',
              margin: '0 auto'    
            }} 
          />
        </div>
        
        <h1>Inserisci il codice<br />che trovi sulla mail!</h1>
        <p style={{marginBottom: '15px', color: '#666', fontSize: '14px'}}>mariorossi@gmail.com</p>
        
        <div className="input-group">
          <label>Codice</label>
          <input type="text" placeholder="Inserisci codice"/>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
        <button className="WE">Invia di nuovo</button>
        <button className="de" onClick={() => setDato(5)}>Conferma</button>
      </div>
      
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
        <div className = "container-sfondo schermata-6">
        <div className="Step step-header-layout">
          <div className="top-navigation">
            <div className="arrows-container">
              <IoIosArrowDown className="top-icon" />
              <IoIosArrowUp className="top-icon" />
            </div>
                <div className="logo">
  <img 
    src={logoImage} 
    alt="Flowlee" 
    style={{ 
      width: 'auto',      // Mantiene le proporzioni
      height: '20px',     // Fissa l'altezza (o usa max-height per sicurezza)
      display: 'block',
      margin: '0 auto'    // Centra il logo
    }} 
  />
</div>
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
        <div className = "container-sfondo schermata-7">
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
              <img src = {logoImage}/>
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
        <div className = "container-sfondo schermata-8">
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
              <img src = {logoImage}/>
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
         <div className = "container-sfondo schermata-9">
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
              <img src = {logoImage}/>
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
        <div className="container-sfondo step10-mobile-fix ">
          <div className="Step wide-mode ">
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
                  <button  className  = "dark kid we" onClick={() => setDato(11)}>Company</button>
                  <button className = "light kid we" onClick={() => onSelectType("Freelance")}>Freelance</button>
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
          <div className="Step wide-mode step11-mobile-fix">
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
                  <div style = {{color: 'black', transform: 'translateY(-13px)',}}>
                    <label className="gv">Grandezza team</label> <br />
                     <select className = "nnnn" style = {{color: 'black'}}>
                      <option>1-5 persone  29/mese </option>  
                      <option>6-10 persone 49/mese</option>
                      <option>11-29 persone 60/mese</option>
                      </select>
                      <div className="justify-center">
                       
                      </div>
                    </div>
                  </div>
                  <div style = {{color: 'black'}}>

                    <label className = "osd">Descrizione</label>
               

                    <input type = "text" className = "li2"/>
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
  <div className="container-sfondo schermata-12">

    {/* spazio vuoto sopra */}
    <div className="spazio-top-12"></div>

    {/* barra superiore separata */}
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
        <img 
          src={logoImage} 
          alt="Flowlee" 
          style={{ height: "20px", width: "auto" }} 
        />
      </div>

      <div className="right-icons">
        <BsGrid3X3Gap className="top-icon" />
        <HiOutlineUserCircle className="top-icon" />
      </div>
    </div>


    {/* spazio tra barra e riquadro */}
    <div className="spazio-barra-12"></div>


    {/* riquadro bianco */}
    <div className="Step wide-mode step12-box">

      <div className="step10-content">

        <div className="step10-left">
          <h1 className="section-title">
            Inserisci<br />
            Solo alcuni<br />
            dati di contatto
          </h1>

          <p className="step10-subtitle">
            Qui inseriamo un secondo testo<br />
            per ora è un placeholder
          </p>
        </div>

        <div className="step10-right"></div>

      </div>


      <div className="dsf4" />

      <label className="ce8">
        Indirizzo
      </label>

      <input 
        type="text" 
        className="dj8" 
        placeholder="Company" 
      />


      <label className="ce9">
        Email
      </label>

      <input 
        type="text" 
        className="dj9" 
        placeholder="Inserisci email" 
      />


      <label className="ce10">
        Telefono
      </label>

      <input 
        type="text" 
        className="d10" 
        placeholder="Telefono" 
      />


      <div className="step10-buttons">

        <button 
          className="dark" 
          onClick={() => setDato(13)}
        >
          Procedi
        </button>

        <button 
          className="light" 
          onClick={() => onSelectType("Freelance")}
        >
          Salva
        </button>

      </div>

    </div>

  </div>
)}


{dato === 13 && (
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
  // 4. Fondamentale: usa 'screen' per sovrapporre il colore come luselee
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
            <button style={{ backgroundColor: '#000', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }} onClick={() => setDato(14)}>Salva</button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}


{dato === 14 && (
  
   <div className = "container-sfondo step14-container">
        <div className="Step wide-mode ">
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
              <img src = {logoImage}/>
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


         <div className="kk3">
  <label>Ruolo</label> <br />
   <select className="rew2">
    <option>Seleziona un ruolo</option>
    <option value="creatore">Creatore</option>
    <option value="secondo_ordine">Di secondo ordine</option>
  </select>
</div>


         <button className = "bv2 posiziona-step-13" onClick = {() => setDato(15)}>
          Procedi
         </button>
            
          </div>

          </div>
         
          
          
)}
       {dato === 15 && (
  <div className="container-sfondo step15-container">
    <div className="Step step-centrato ">
      {/* Header */}
      <div className="top-navigation  ">
        <div className="nav-left">
          <div className="arrows-container">
            <IoIosArrowDown className="top-icon" />
            <IoIosArrowUp className="top-icon" />
          </div>
          <div className="profilo-lavoro-container">
            <span>Organizzazione/modello di lavoro</span>
          </div>
        </div>
        <div className="nav-center">
          <img src = {logoImage}/>
          </div>
          
        <div className="right-icons">
          <BsGrid3X3Gap className="top-icon" />
          <HiOutlineUserCircle className="top-icon" />
        </div>
      </div>

      {/* Titolo e Sottotitolo */}
      <div className="er">
        <h1>Qual'è il modello <br /> lavorativo adottato <br /> dalla tua azienda?</h1>
        <div className="flex-beetween dio">
          <span>Iniziamo insieme, potrai modificare <br /> queste scelte in ogni momento.</span>
        </div>
      </div>

      {/* Giorni lavorativi */}
      <div className="ax">
        <h3>Giorni lavorativi</h3>
        <div className="giorni-wrapper">
          {['L', 'M', 'M', 'G', 'V', 'S', 'D'].map((g, i) => (
            <button key={i} className="giorno-btn">{g}</button>
          ))}
        </div>
      </div>

      {/* Modelli di Lavoro (Toggle) */}
      <div className="modelli-wrapper">
        {[
          { t: "Autonomo", d: "Orario gestito dal dipendente nel rispetto di obiettivi, attività e disponibilità concordate." },
          { t: "Flessibile"},
          {t: "Fisso"}
          
        ].map((item, index) => (
          <div key={index} className="toggle-row">
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>
            <div className="toggle-text">
              <strong>{item.t}</strong>
              <p>{item.d}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottone */}
      <button className="bv2" onClick={() => setDato(16)}>Procedi</button>
    </div>
  </div>
)}
{dato === 16 && (
  <div className="container-sfondo">
    <div className="Step step-centrato">
      {/* Header */}
      <div className="top-navigation">
        <div className="nav-left">
          <div className="arrows-container">
            <IoIosArrowDown className="top-icon" />
            <IoIosArrowUp className="top-icon" />
          </div>
          <div className="profilo-lavoro-container">
            <span>Organizzazione/orario</span>
          </div>
        </div>
        <div className="nav-center">
          <img src = {logoImage}/>
          </div>
        <div className="right-icons">
          <BsGrid3X3Gap className="top-icon" />
          <HiOutlineUserCircle className="top-icon" />
        </div>
      </div>

      {/* Titolo e Sottotitolo */}
      <div className="er">
        <div className="flex-beetween">
          <h1>Come gestisci gli <br /> orari secondo il <br /> modello flessibile? </h1>
          <span>Iniziamo insieme ,potrai modificare queste <br /> scelte in ogni momento </span>
        </div>

        <div className="llj fg">
          <h1>Monte orario</h1>
          <p>Ciascun dipendente ha l'obbligo di lavorare un numero di ore prestabilito che può distribuire nella giornata.</p>
          
          <div className="contenitore">
            <button type = "uy" className="vc">Settimanale</button>
            <button  type = "as" className="pi">Giornaliero</button>
            
            <div className="contatore-ore">
              <span>6 ore</span>
              <button>-</button>
              <button>+</button>
            </div>
          </div>

          <div className="range-box">
            <div className="range-toggle">
              <input type="checkbox" />
              <label>Range orario</label>
            </div>
            <p>Il monte orario deve comunque essere distribuito in un determinato range orario.</p>
            
            <div className="orari-input">
              <span>Dalle <button>07:00 - +</button></span>
              <span>Alle <button>20:00 - +</button></span>
            </div>
            <p className="avviso">In questo modo stai impostando un orario fisso.</p>
          </div>
        </div>

        <div className="df">
          <button className="gf" onClick={() => setDato(17)}>
            Procedi
          </button>
        </div>
      </div>
    </div>
  </div>
)}

{dato === 17 && (
  <div className="container-sfondo schermata-17">
    <div className="Step step-centrato">
      {/* Header */}
      <div className="top-navigation">
        <div className="nav-left">
          <div className="arrows-container">
            <IoIosArrowDown className="top-icon" />
            <IoIosArrowUp className="top-icon" />
          </div>
          <div className="profilo-lavoro-container">
            <span>Organizzazione/Pausa pranzo</span>
          </div>
        </div>
        <div className="nav-center">
          <img src={logoImage} />
        </div>
        <div className="right-icons">
          <BsGrid3X3Gap className="top-icon" />
          <HiOutlineUserCircle className="top-icon" />
        </div>
      </div>

      {/* Titolo e Sottotitolo */}
      <div className="er">
        <h1>In che modo viene <br /> gestita la <br /> pausa pranzo?</h1>
        <div className="ry7">
          <span>Iniziamo insieme, potrai modificare <br /> queste scelte in ogni momento</span>
        </div>
      </div>

      {/* Modelli di Lavoro (Toggle) */}
      <div className="modelli-wrapper4">
        {[
          { 
            t: "Autonoma", 
            d: "Ciascun dipendente può prendere la pausa pranzo quando preferisce, coordinandosi con i colleghi." 
          },
          { 
            t: "Flessibile", 
            d: "Ogni dipendente può avere 1h di pausa pranzo,in un determinato orario." 
          },
          { 
            t: "Fissa", 
            d: "I dipendenti hanno la pausa nello stesso orario." 
          }
        ].map((item, index) => {
          const isChecked = selezionati[index] || false;

          return (
            <div key={index} className="toggle-row4">
              <label className="internaz">
                <input 
                  type="checkbox" 
                  checked={isChecked} 
                  onChange={(e) => {
                    setSelected({
                      ...selezionati,
                      [index]: e.target.checked
                    });
                  }} 
                />
                <span className="slider6"></span>
              </label>
              <div className="toggle-text">
                <strong>{item.t}</strong>
                <div className="details-container">
                  <p>{item.d}</p>
                  
                  {/* Selettore orario per Flessibile */}
                  {item.t === "Flessibile" && (
                    <div className="orari-selettori" style={{ marginTop: '10px', display: 'flex', gap: '15px', alignItems: 'center', fontSize: '14px' }}>
                      <div>
                        <span>Dalle </span>
                        <button onClick={() => modificaOrario('flessibileDalle', '-')} style={{ cursor: 'pointer', margin: '0 4px' }}>-</button>
                        <span>{String(orari.flessibileDalle).padStart(2, '0')}:00</span>
                        <button onClick={() => modificaOrario('flessibileDalle', '+')} style={{ cursor: 'pointer', margin: '0 4px' }}>+</button>
                      </div>
                      <div>
                        <span>Alle </span>
                        <button onClick={() => modificaOrario('flessibileAlle', '-')} style={{ cursor: 'pointer', margin: '0 4px' }}>-</button>
                        <span>{String(orari.flessibileAlle).padStart(2, '0')}:00</span>
                        <button onClick={() => modificaOrario('flessibileAlle', '+')} style={{ cursor: 'pointer', margin: '0 4px' }}>+</button>
                      </div>
                    </div>
                  )}

                  {/* Selettore orario per Fissa (come da design Figma) */}
                  {item.t === "Fissa" && (
                    <div className="orari-selettori" style={{ marginTop: '10px', display: 'flex', gap: '15px', alignItems: 'center', fontSize: '14px' }}>
                      <div>
                        <span>Dalle </span>
                        <button onClick={() => modificaOrario('fissaDalle', '-')} style={{ cursor: 'pointer', margin: '0 4px' }}>-</button>
                        <span>{String(orari.fissaDalle).padStart(2, '0')}:00</span>
                        <button onClick={() => modificaOrario('fissaDalle', '+')} style={{ cursor: 'pointer', margin: '0 4px' }}>+</button>
                      </div>
                      <div>
                        <span>Alle </span>
                        <button onClick={() => modificaOrario('fissaAlle', '-')} style={{ cursor: 'pointer', margin: '0 4px' }}>-</button>
                        <span>{String(orari.fissaAlle).padStart(2, '0')}:00</span>
                        <button onClick={() => modificaOrario('fissaAlle', '+')} style={{ cursor: 'pointer', margin: '0 4px' }}>+</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottone */}
      <button className="bv24" onClick={() => setDato(18)}>Procedi</button>
    </div>
  </div>
)}
{dato === 18 &&(
   <div className="container-sfondo">
    <div className="Step step-centrato2">
      {/* Header */}
      <div className="top-navigation">
        <div className="nav-left">
          <div className="arrows-container">
            <IoIosArrowDown className="top-icon" />
            <IoIosArrowUp className="top-icon" />
          </div>
          <div className="profilo-lavoro-container">
            <span>Organizzazione/Pausa pranzo</span>
          </div>
        </div>

        
        <div className="nav-center">
          <img src = {logoImage}/>
          </div>
        <div className="right-icons">
          <BsGrid3X3Gap className="top-icon" />
          <HiOutlineUserCircle className="top-icon" />
        </div>
      </div>

      {/* Titolo e Sottotitolo */}
      <div className = "er2">
        <h1> Perfetto,  ho tutte le   <br /> informazioni <br /> necessarie! </h1>
        <div className = "ry7">
        </div>
        </div>

      <div className = "samp">

        <button type = "dfj" className = "seriea" onClick = {() => setDato(19)}>
          Crea il mio progetto</button>
        <button type = "fgdf" className = "serieb" onClick = {() => setDato(19)}>
          Aggiungi persone</button>
        </div>

        <img src = {violetto} className = "we23"/>

        <img src = {Settings} className = "impostazioni"/>

        <div className = "Scrittore">
        <p> Impostazioni</p>
        </div>
        </div>
        </div>
)}

{dato === 19 &&(
  
     <div className="container-sfondo">
    <div className="Step step-centrato2">
      {/* Header */}
      <div className="top-navigation">
        <div className="nav-left">
          <div className="arrows-container">
            <IoIosArrowDown className="top-icon" />
            <IoIosArrowUp className="top-icon" />
          </div>
          <div className="profilo-lavoro-container">
            <span>Organizzazione/Pausa pranzo</span>
          </div>
        </div>
        <div className="nav-center">
          <img src = {logoImage}/>
          </div>
        <div className="right-icons">
          <BsGrid3X3Gap className="top-icon" />
          <HiOutlineUserCircle className="top-icon" />
        </div>
      </div>

      <div className = "er2">
      <h1>Perfetto, <br /> Possiamo iniziare!</h1>
      </div>


     <div className = "avviso2">
      <span><span className="cerchio-rosso"></span>Prova Flowlee con 3 progetti e un totale di 5 persone. <br /> </span>
      <span>Dopodichè, puoi isciverti al Premium.</span>
      </div>

      <button className = "Bottone1" onClick = {() => setDato(20)}>
        Crea il mio progetto
       </button>
       <button className = "Bottone2" onClick = {() => setDato(20)}>
        Impostazioni
       </button>

           <img src = {violetto} className = "we23"/>

      </div>
     </div>
)}
{dato === 20 && (
  <div className="container-sfondo">

    <div className="Step step-centrato2">

      <h1 className="titolo-principale">
        Impostazioni azienda
      </h1>


      <div className="layout-impostazioni">


        <div className="titoli">
          {titoli.map((sr) => (
            <button
              key={sr}
              type="button"
              className={`sr ${Stella === sr ? "active" : ""}`}
              onClick={() => setStella(sr)}
            >
              {sr}
            </button>
          ))}
        </div>




        <div className="colonna-destra">


          <div className="sezione-gruppo">

            <h3 className="titolo-sezione">
              Creatore
            </h3>

            <p className="testo-descrizione">
              Gestisce le impostazioni principali dell'azienda
              e ha il controllo completo.
            </p>


            <div className="card-utente">

              <div className="info-utente">
                <div className="avatar-placeholder"></div>
                <span>Tu</span>
              </div>


              <div className="azioni-utente">
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">✕</button>
              </div>

            </div>

          </div>





          <div className="sezione-gruppo">


            <h3 className="titolo-sezione">
              Amministratori
            </h3>


            <p className="testo-descrizione">
              Possono collaborare alla gestione dell'azienda
              e modificare le impostazioni assegnate.
            </p>



            <div className="card-utente">
              <div className="info-utente">
                <div className="avatar-placeholder"></div>
                <span>Tu</span>
              </div>

              <div className="azioni-utente">
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">✕</button>
              </div>
            </div>



            <div className="card-utente">
              <div className="info-utente">
                <div className="avatar-placeholder"></div>
                <span>Emilio Zappalardo</span>
              </div>

              <div className="azioni-utente">
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">✕</button>
              </div>
            </div>



            <div className="card-utente">
              <div className="info-utente">
                <div className="avatar-placeholder"></div>
                <span>Federica Fontana</span>
              </div>

              <div className="azioni-utente">
                <button className="btn-icon">✏️</button>
                <button className="btn-icon">✕</button>
              </div>
            </div>



            <button className="btn-aggiungi-admin">
              <span>+</span>
              Aggiungi amministratore
            </button>


          </div>





          <button 
            className="ert"
            onClick={() => setDato(21)}
          >
            Salva
          </button>


        </div>


      </div>


    </div>

  </div>
)}
{dato === 21 &&(
<div className="container-sfondo">

<div className="Step step-centrato2">

<h1 className="titolo-principale">
Impostazioni azienda
</h1>


<div className="layout-impostazioni">


<div className="titoli">
{titoli.map((sr)=>(
<button
key={sr}
className={`sr ${Stella===sr?"active":""}`}
onClick={()=>setStella(sr)}
>
{sr}
</button>
))}
</div>



<div className="colonna-destra">


<div className="sezione-gruppo">

<h3 className="titolo-sezione">
Creatore
</h3>

<p className="testo-descrizione">
Gestisce le impostazioni principali dell'azienda e ha il controllo completo.
</p>


<div className="card-utente">

<div className="info-utente">
<div className="avatar-placeholder"/>
<span>Tu</span>
</div>

<div className="azioni-utente">
<button className="btn-icon">✏️</button>
<button className="btn-icon">✕</button>
</div>

</div>

</div>



<div className="sezione-gruppo">

<h3 className="titolo-sezione">
Amministratori
</h3>


<p className="testo-descrizione">
Possono collaborare alla gestione dell'azienda e modificare le impostazioni assegnate.
</p>



{["Tu","Emilio Zappalardo","Federica Fontana"].map((nome)=>(
<div className="card-utente" key={nome}>

<div className="info-utente">
<div className="avatar-placeholder"/>
<span>{nome}</span>
</div>

<div className="azioni-utente">
<button className="btn-icon">✏️</button>
<button className="btn-icon">✕</button>
</div>

</div>
))}



<button className="btn-aggiungi-admin">
<span>+</span>
Aggiungi amministratore
</button>


</div>



<div className="blocco-rimozione">

<p>
Vuoi rimuovere Emilio Zappalardo dagli <br/>
amministratori di company srl ?
</p>


<div className="sfm">

{[
"Emilio Z. non avrà piu accesso alle modifiche e progetti degli amministratori",
"Emilio Z. continuerà a far parte del team come product designer, gestione su Team > persone"
].map((t,i)=>(

<div className="switch-riga" key={i}>

<label className="fj">
<input type="checkbox"/>
<span className="qwr"/>
</label>

<div className="sfd">
<strong>{t}</strong>
</div>

</div>

))}

</div>

</div>



<button
className="ert"
onClick={()=>setDato(22)}
>
Conferma
</button>


<button className="bit2">
Chiudi
</button>



</div>

</div>

</div>

</div>
)}

{dato === 22 &&(
<div className="container-sfondo">

<div className="Step step-centrato2">

<h1 className="titolo-principale">
Impostazioni azienda
</h1>


<div className="layout-impostazioni">


<div className="titoli">
{titoli.map((sr)=>(
<button
key={sr}
className={`sr ${Stella===sr?"active":""}`}
onClick={()=>setStella(sr)}
>
{sr}
</button>
))}
</div>



<div className="colonna-destra">


<div className="sezione-gruppo">

<h3 className="titolo-sezione">
Creatore
</h3>

<p className="testo-descrizione">
Gestisce le impostazioni principali dell'azienda e ha il controllo completo.
</p>


<div className="card-utente">

<div className="info-utente">
<div className="avatar-placeholder"/>
<span>Tu</span>
</div>

<div className="azioni-utente">
<button className="btn-icon">✏️</button>
<button className="btn-icon">✕</button>
</div>

</div>

</div>



<div className="sezione-gruppo">

<h3 className="titolo-sezione">
Amministratori
</h3>


<p className="testo-descrizione">
Possono collaborare alla gestione dell'azienda e modificare le impostazioni assegnate.
</p>



{["Tu","Emilio Zappalardo","Federica Fontana"].map((nome)=>(
<div className="card-utente" key={nome}>

<div className="info-utente">
<div className="avatar-placeholder"/>
<span>{nome}</span>
</div>

<div className="azioni-utente">
<button className="btn-icon">✏️</button>
<button className="btn-icon">✕</button>
</div>

</div>
))}



<button className="btn-aggiungi-admin">
<span>+</span>
Aggiungi amministratore
</button>


</div>



<div className="blocco-rimozione">



<div className="sfm">

   <div className="card">
              <div className="info-utente">
                <div className="avatar-placeholder"></div>
                <span>Emilio Zappalardo</span>
                
              </div>
              </div>
               <div className="card">
              <div className="info-utente">
                <div className="avatar-placeholder"></div>
                <span>Riccardo Saltarino</span>
                
              </div>
              </div>

               <div className="card">
              <div className="info-utente">
       
             
               <h1>Sostituisci con</h1>
                <span>Ric</span>
                
              </div>
              </div>




</div>



</div>

</div>



<button
className="ert"
onClick={()=>setDato(23)}
>
C
</button>






</div>

</div>

</div>


)}

{dato === 23 && (
        <div className="container-sfondo">
          <div className="Step step-centrato2">
            <h1 className="titolo-principale">Impostazioni azienda</h1>

            <div className="layout-impostazioni">
              <div className="titoli">
                {titoli.map((sr) => (
                  <button
                    key={sr}
                    className={`sr ${Stella === sr ? "active" : ""}`}
                    onClick={() => setStella(sr)}
                  >
                    {sr}
                  </button>
                ))}
              </div>

              <div className="colonna-destra">
                <div className="sezione-gruppo">
                  <h3 className="titolo-sezione">Creatore</h3>
                  <p className="testo-descrizione">
                    Gestisce le impostazioni principali dell'azienda e ha il controllo completo.
                  </p>

                  <div className="card-utente">
                    <div className="info-utente">
                      <div className="avatar-placeholder" />
                      <span>Tu</span>
                    </div>
                    <div className="azioni-utente">
                      <button className="btn-icon">✏️</button>
                      <button className="btn-icon">✕</button>
                    </div>
                  </div>
                </div>

                <div className="sezione-gruppo">
                  <h3 className="titolo-sezione">Amministratori</h3>
                  <p className="testo-descrizione">
                    Possono collaborare alla gestione dell'azienda e modificare le impostazioni assegnate.
                  </p>

                  {["Tu", "Tu"].map((nome) => (
                    <div className="card-utente" key={nome}>
                      <div className="info-utente">
                        <div className="avatar-placeholder" />
                        <span>{nome}</span>
                      </div>
                      <div className="azioni-utente">
                        <button className="btn-icon">✏️</button>
                        <button className="btn-icon">✕</button>
                      </div>
                    </div>
                  ))}

                  <button className="btn-aggiungi-admin">
                    <span>+</span>
                    Aggiungi amministratore
                  </button>
                </div>

                <div className="sfm" />
              </div>
            </div>
               <button 
                className="btn-invita" 
                onClick={() => setDato(24)}
                style={{ 
                  backgroundColor: "black", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "20px", 
                  padding: "10px 24px", 
                  fontWeight: "bold", 
                  cursor: "pointer" 
                }}
              >
                Invita
              </button>

           
            <div className="sre" style={{ marginTop: "20px", textAlign: "left" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "24px" }}>⚠️</span>
                <p style={{ fontWeight: "bold", margin: 0 }}>
                  Al momento, risulti solo tu nell'organizzazione.
                </p>
              </div>
              
              <p className="testo-descrizione" style={{ marginBottom: "12px" }}>
                Per aggiungere degli amministratori, devono comparire <br />
                come persone all'interno della tua organizzazione <br />
              </p>
              <p>Invita dunque delle persone nell'organizzazione <br /> e aggiungile come amministratori!</p>
              
             
            </div>
          </div>
        </div>
      )}

      {/* --- SCHERMATA 24 --- */}
      {dato === 24 && (
        <div className = "container-24" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          zIndex: 9999
        }}>
          {/* Sfondo sfumato */}
          <div style={{
            position: 'absolute',
            width: '1000px',
            height: '1000px',
            background: `
              radial-gradient(circle at 40% 50%, rgba(255, 120, 130, 1.3) 0%, transparent 50%),
              radial-gradient(circle at 60% 50%, rgba(100, 90, 200, 0.8) 0%, transparent 50%)
            `,
            filter: 'blur(120px)',
            mixBlendMode: 'screen',
            opacity: 1,
            pointerEvents: 'none',
            zIndex: 0
          }} />

          {/* Contenitore modale */}
          <div style={{
            position: 'relative',
            zIndex: 1,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#000', margin: 0 }}>Impostazioni azienda</h2>
              <button onClick={() => setDato(23)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>✕</button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '220px 180px 1fr', gap: '40px' }}>
              {/* Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button style={{ backgroundColor: '#000', color: '#fff', border: 'none', padding: '12px', borderRadius: '10px', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}>Dettagli dell'azienda</button>
                <button style={{ backgroundColor: 'transparent', border: '1px solid #e5e5e5', padding: '12px', borderRadius: '10px', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}>Modifica amministratori</button>
                <button style={{ backgroundColor: 'transparent', border: '1px solid #e5e5e5', padding: '12px', borderRadius: '10px', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}>Contatti aziendali</button>
                <button style={{ backgroundColor: 'transparent', border: '1px solid #e5e5e5', padding: '12px', borderRadius: '10px', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}>Fatturazione e pagamento</button>
                <button style={{ backgroundColor: 'transparent', border: '1px solid #e5e5e5', padding: '12px', borderRadius: '10px', textAlign: 'left', fontSize: '13px', cursor: 'pointer' }}>Modello e orario di lavoro</button>
              </div>

              {/* BOX CENTRALE CARD AMMINISTRATORI */}

<div style={{
  display:"flex",
  flexDirection:"column",
  width:"260px"
}}>

  <h3 style={{
    fontSize:"14px",
    margin:0
  }}>
    Creatore
  </h3>


  <p style={{
    fontSize:"11px",
    color:"#888"
  }}>
    Gestisce le impostazioni principali dell'azienda e ha il controllo completo.
  </p>


  <div className="card-utente">

    <div className="info-utente">
      <div className="avatar-placeholder"/>
      <span>Tu</span>
    </div>

    <div className="azioni-utente">
      <button className="btn-icon">✏️</button>
      <button className="btn-icon">✕</button>
    </div>

  </div>



  <h3 style={{
    fontSize:"14px",
    marginTop:"15px"
  }}>
    Amministratori
  </h3>


  <p style={{
    fontSize:"11px",
    color:"#888"
  }}>
    Possono collaborare alla gestione dell'azienda e modificare le impostazioni assegnate.
  </p>


{["Tu","Emilio Zappalardo","Federica Fontana"].map((nome)=>(
  <div 
    className={`card-utente ${nome === "Emilio Zappalardo" ? "card-emilio" : ""}`} 
    key={nome}
  >


      <div className="info-utente">
        <div className="avatar-placeholder"/>
        <span>{nome}</span>
      </div>

      <div className="azioni-utente">
        <button className="btn-icon">✏️</button>
        <button className="btn-icon">✕</button>
      </div>

    </div>
  ))}



  <button className="btn-aggiungi-admin">
    <span>+</span>
    Aggiungi amministratore
  </button>

<div className = "wet">
  {[
    {T: "Riccardo V. sostituirà Emilio Z nella visualizzazione e modifica di e progetti nelle feature riservate agli amministratori"}
  ].map((item,index) => (
  <div key = {index}>
<label className = "s13">
  <input type = "checkbox"/>
  <span className = "dkdf"/>
</label>
  <div className = "inty">
    <strong>{item.T}</strong>
    </div>
   </div>
  ))}
  </div>
  </div>


 <button className = "ciao" type = "sdjnk">Chiudi</button>
 </div>
 
                
               

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button style={{ backgroundColor: '#000', color: '#fff', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer' }} className = "sfabe" onClick={() => setDato(25)}>Sostituisci</button>
                </div>
              </div>
            </div>
            
          
          
        
      )}
    {dato === 25 &&(
   
   <div className = "container-sfondo schermata-25">
        <div className="Step wide-mode">
          <div className="top-navigation">
            <div className="nav-left">
              <div className="arrows-container">
                <IoIosArrowDown className="top-icon" />
                <IoIosArrowUp className="top-icon" />
              </div>
              <div className="profilo-lavoro-container">
                <span>Organizzazione/codice</span>
              </div>
            </div>

            <div className="nav-center">
              <img src = {logoImage}/>
            </div>
         
            <div className="right-icons">
              <BsGrid3X3Gap className="top-icon" />
              <HiOutlineUserCircle className="top-icon" />
            </div>
          </div>


          <div className = "titolo-codice" >
            <h1> Inserisci il codice <br />
                di attivazione<br />
                che hai ricevuto*
                </h1>
          </div>

         <div className = "syt">
          <span>Il codice è nella mail tramite la quale<br />
          in cui ha ricevuto questo invito</span>
          </div>

         <div className= "amen2">
         <span>Problemi con il codice ? </span>
          </div>


          
          
          <div className = "zr">
          <label>Company</label> <br />
          <input className = "rew" type = "text"  placeholder = "Company srl"/>
          </div>


         <div className="kk">
  <label>Codice attivazione</label> <br />
  <input className = "rh" type = "text" placeholder = "SRL453DR"></input>
</div>


  <div className = "test">
  <label>Piano attivo</label>
  <input className = "sb5" type = "text" placeholder = "Premium 100 account"/>
  </div>
  


         <button className = "bv2 posiziona-step-13" onClick = {() => setDato(26)}>
          Procedi
         </button>
            
          </div>

          </div>
         
          
          
)}
    {dato === 26 && (
  <div className="container-sfondo step10-mobile-fix">

    <img src={barra} className="siro" />

    <div className="Step wide-mode">

      <div className="top-navigation">
        <div className="nav-left">
          <div className="arrows-container">
            <IoIosArrowDown className="top-icon" />
            <IoIosArrowUp className="top-icon" />
          </div>

          <div className="profilo-lavoro-container">
            <span>Company Srl/Persone</span>
          </div>
        </div>

        <div className="nav-center">
          <img 
            src={logoImage} 
            alt="Flowlee" 
            style={{ height: "20px", width: "auto" }} 
          />
        </div>

        <div className="right-icons">
          <BsGrid3X3Gap className="top-icon" />
          <HiOutlineUserCircle className="top-icon" />
        </div>
      </div>


      <div className="step10-content">
        <div className="step10-left">

          <h1 className="section-title">
            Inseriamo una persona <br />
            nell'organizazione?<br />
          </h1>

          <div className="step10-buttons">
            <button className="dark yuri" onClick={() => setDato(27)}>
              Crea profilo
            </button>

            <button 
              className="light" 
              onClick={() => onSelectType("Freelance")}
            >
              Link veloce
            </button>
          </div>

        </div>


        <div className="step10-right">
          <img src={violetto} alt="Flowlee" className="step10-image" />
        </div>

      </div>

    </div>
  </div>
)}

{dato === 27 &&(

        


  <div className="container-sfondo sfondo-scuro">

    <div className="Step wide-mode step27-mobile-fix">

      <div className="top-navigation">
        
        <div className="nav-left">
          <div
            className="arrows-container"
            onClick={onBack}
            style={{ cursor: "pointer" }}
          >
            <IoIosArrowDown className="top-icon" />
            <IoIosArrowUp className="top-icon" />
          </div>

          <div className="profilo-lavoro-container">
            <span>Company srl / Persona</span>
          </div>
        </div>

        <div className="nav-center">
          <img
            src={logoImage}
            alt="Flowlee"
            style={{ height: "20px", width: "auto" }}
          />
        </div>

        <div className="right-icons">
          <BsGrid3X3Gap className="top-icon" />

          <HiOutlineUserCircle className="top-icon" />
        </div>
      </div>
      

      <div
        className="step10-content"
        style={{
          display: "flex",
          gap: "40px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >

        {/* COLONNA SINISTRA */}
        <div
          className="step10-right"
          style={{ flex: "1", maxWidth: "300px" }}
        >
          <div className="w-full aspect-square  flex flex-col items-center justify-center bg-white shadow-sm">

            <img
              src={rettangolo}
              className="img-box"
              alt="Profilo"
            />

          </div>
        </div>

        {/* COLONNA DESTRA */}
        <div
          className="step10-left"
          style={{ flex: "1", maxWidth: "400px" }}
        >
          <div className="space-y-4">

            <div>
              <label className="rv">Nome</label>
              <br />

              <input
                type="text"
                className="li"
                placeholder="Inserisci nome"
              />
            </div>

            <div
              style={{
                color: "black",
                transform: "translateY(-13px)",
              }}
            >
              <label className="gv">Cognome</label>
              <br />

              <input
                className="nnnn"
                placeholder="Frittura"
                style={{ color: "black" }}
              />

              <div className="justify-center">
                <div className="noi">
                  <label className="jes">Ruoli</label>

                  <div className="klo">
                    <select>
                      <option>Project Manager</option>
                      <option>Sviluppatore</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ color: "black" }}>
              <label className="batma">Overview</label>
              <br />

              <textarea
                className="luc"
                placeholder="Descrizione"
              />

              <button
                className="jj"
                onClick={() => setDato(28)}
              >
                Procedi
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>

    <img
      src={barra}
      className="siro"
      alt="Barra"
    />

  </div>
)}

{dato == 28 &&(

  <div className="container-sfondo sfondo-scuro">

    <div className="Step wide-mode step27-mobile-fix">

      <div className="top-navigation">

        <div className="nav-left">

          <div
            className="arrows-container"
            onClick={onBack}
            style={{ cursor: "pointer" }}
          >
            <IoIosArrowDown className="top-icon" />
            <IoIosArrowUp className="top-icon" />
          </div>

          <div className="profilo-lavoro-container">
            <span>Company srl / Persona</span>
          </div>

        </div>


        <div className="nav-center">
          <img
            src={logoImage}
            alt="Flowlee"
            style={{ height: "20px", width: "auto" }}
          />
        </div>


        <div className="right-icons">
          <BsGrid3X3Gap className="top-icon" />
          <HiOutlineUserCircle className="top-icon" />
        </div>

      </div>



      <div
        className="step10-content"
        style={{
          display: "flex",
          gap: "40px",
          alignItems: "center",
          justifyContent: "center",
        }}
      >


        {/* COLONNA SINISTRA */}
        <div
          className="step10-right"
          style={{
            flex: "1",
            maxWidth: "300px"
          }}
        >

          <div className="w-full aspect-square flex flex-col items-center justify-center">

            <div className="hiro">


              <div className="testata-container">
                <h1>
                  <span>Come</span>
                  <span className="second-line">
                    contatto Marta?
                  </span>
                </h1>


                <p className="subtitle">
                  <span>Selezionerai la visibilità <br />
                  <span>dei dati di contatto più avanti</span></span>
                </p>
              </div>


              <div className="foto-e-dati-container">
                <img
                  src={group}
                  alt="Marta"
                  className="foto-marta"
                />
                <div className="dati-lato-foto">
                  <span className="nome-marta">Marta Frittura</span>
                  <span className="ruolo-marta"> Project Manager</span>
                </div>
              </div>


            </div>

          </div>

        </div>





        {/* COLONNA DESTRA */}
        <div
          className="step10-left"
          style={{
            flex: "1",
            maxWidth: "400px"
          }}
        >

          <div className="space-y-4">


            <div>

              <label className="rv">
                Intranet
              </label>

              <br />

              <input
                type="text"
                className="li"
                placeholder="Inserisci indirizzo"
              />

            </div>




            <div
              style={{
                color: "black",
                transform: "translateY(-13px)",
              }}
            >

              <label className="gv">
                Email
              </label>

              <br />


              <input
                className="nnnn"
                placeholder="Frittura"
                style={{
                  color: "black"
                }}
              />



              <div className="justify-center">

                <div className="noi">

                  <label className="jes">
                    Whatsapp
                  </label>


                  <div className="klo">

                    <select>

                      <option>
                        Project Manager
                      </option>

                      <option>
                        Sviluppatore
                      </option>

                    </select>

                  </div>

                </div>

              </div>


            </div>





            <div style={{ color: "black" }}>

              <div className="flex gap-3 items-center mt-4">


                <button
                  className="kilo"
                  onClick={() => setDato(29)}
                >
                  Procedi
                </button>


                <button
                  type="button"
                  className="Sim"
                >
                  Salva
                </button>


              </div>

            </div>


          </div>

        </div>


      </div>


    </div>




    <img
      src={barra}
      className="siro"
      alt="Barra"
    />


  </div>
)}


{dato === 29 &&(

  <div className="container-sfondo step15-container step29-height">
    <div className="Step step-centrato">

      {/* Header */}
      <div className="top-navigation">
        <div className="nav-left">
          <div className="arrows-container">
            <IoIosArrowDown className="top-icon" />
            <IoIosArrowUp className="top-icon" />
          </div>

          <div className="profilo-lavoro-container">
            <span>Company srl / Permessi</span>
          </div>
        </div>

        <div className="nav-center">
          <img src={logoImage} alt="Logo" />
        </div>

        <div className="right-icons">
          <BsGrid3X3Gap className="top-icon" />
          <HiOutlineUserCircle className="top-icon" />
        </div>
      </div>

      {/* Foto Marta */}
      <div className="foto-wrapper step29-foto">
        <img
          src={group}
          alt="Marta"
          className="foto-marta renna"
        />
      </div>

      {/* Titolo */}
      <div className=" er step29-titolo monte">
        <h1>
          Impostiamo
          <br />
          un po' di permessi
        </h1>

        <div className="flex-beetween">
          <span>
            Seleziona i permessi di Marta
            <br />
            all'interno dell'ecosistema FlowLee.
          </span>
        </div>
      </div>

      {/* Toggle */}
      <div className="modelli-wrapper step29-modelli">
        {[
          {
            t: "Piccola frase imprenditoriale che descriva una dinamica",
          },
          {
            t: "Piccola frase imprenditoriale che descriva una dinamica",
            d: "Orario gestito liberamente dal dipendente nel rispetto di obiettivi, attività e disponibilità concordate",
          },
          {
            t: "Piccola frase impersonale che descriva una dinamica",
          },
          {
            t: "Piccola frase impersonale che descriva una dinamica",
          },
        ].map((item, index) => (
          <div key={index} className="toggle-row">
            <label className="switch">
              <input type="checkbox" />
              <span className="slider"></span>
            </label>

            <div className="toggle-text">
              <strong>{item.t}</strong>
              {item.d && <p>{item.d}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Bottone */}
      <button
        className=" bv2 step29-bv2"
        onClick={() => setDato(30)}
      >
        Procedi
      </button>

    </div>

    {/* Barra */}
    <div className="barra-container  step29-barra">
      <img
        src={barra}
        alt="Barra"
        className="casa"
      />
    </div>
  </div>
)}

{dato == 30 &&(


  <div className="container-sfondo step15-container step29-height">
  
  <div className="Step step-centrato">

    {/* Header */}
    <div className="top-navigation">
      <div className="nav-left">
        <div className="arrows-container">
          <IoIosArrowDown className="top-icon" />
          <IoIosArrowUp className="top-icon" />
        </div>

        <div className="profilo-lavoro-container">
          <span>Company srl / Permessi</span>
        </div>
      </div>

      <div className="nav-center">
        <img src={logoImage} alt="Logo" />
      </div>

      <div className="right-icons">
        <BsGrid3X3Gap className="top-icon" />
        <HiOutlineUserCircle className="top-icon" />
      </div>
    </div>

    {/* Foto Marta */}
    <div className="foto-wrapper step29-foto">
      <img
        src={group}
        alt="Marta"
        className="foto-marta stelle"
      />
    </div>

    {/* Titolo */}
    <div className="er step29-titolo">
      <h1>
        Come gestisce 
        <br />
        l'orario Marta?
      </h1>

      <div className="flex-beetween">
        <span>
          Seleziona i permessi di Marta
          <br />
          all'interno dell'ecosistema FlowLee.
        </span>
      </div>
    </div>

    {/* Box Info Orario (Come da Figma) */}
    <div className="info-orario-box">
      <div className="info-orario-icon">
        <div className="company-logo-placeholder">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14" stroke="#0052FF" strokeWidth="2" strokeLinecap="round"/>
            <path d="M14 4H18V8" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M10 14L18 6" stroke="#0052FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
      <div className="info-orario-content">
        <strong>Il tuo orario è gestito secondo quello di Company Srl.</strong>
        <p>Lun-Ven, modello flessibile, minimo 6h.</p>
        <p>Fascia oraria 07:00-21:00.</p>
      </div>
    </div>

    {/* Lista Permessi */}
    <div className="cifra">
      {[
        {
          T: "Gestione autonoma parziale dell'orario",
          D: "Permetti a Marta di gestire l' orario in autonomia"
        },
        {
          T: "Gestione autonoma totale dell'orario",
          D: ""
        }
      ].map((item, index) => (
        <div key={index} className="riga-permesso">
          <label className="guf">
            <input type="checkbox"/>
            <span className="loui"/>
          </label>
          <div className="tutto">
            <strong>{item.T}</strong>
            {item.D && <p>{item.D}</p>}
          </div>
        </div>
      ))}
    </div>

    {/* Bottoni giorni della settimana */}
    <div className="aqua">
      {["L","M","M","G","V","S","D"].map((j, k) => (
        <button key={k} className="ryy">{j}</button>
      ))}
    </div>

    {/* Bottone Procedi */}
    <button className="butt" onClick={() => setDato(31)}>
      Procedi
    </button>

  </div>

  {/* Barra posizionata fuori dal box principale, in basso al centro rispetto al contenitore di sfondo */}
  <img src={barra} className="siro" alt="Barra" />
</div>
)}

{dato === 31 && (
<div className="container-sfondo step10-mobile-fix">
    <img src={barra} className="siro" alt="Barra" />

    <div className="Step wide-mode">
      <div className="top-navigation">
        <div className="nav-left">
          <div className="arrows-container">
            <IoIosArrowDown className="top-icon" />
            <IoIosArrowUp className="top-icon" />
          </div>

          <div className="profilo-lavoro-container">
            <span>Company Srl / Orario</span>
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

      {/* Contenitore principale a griglia (abbassato con paddingTop maggiore) */}
      <div style={{ display: "grid", gridTemplateColumns: "280px 480px", columnGap: "24px", rowGap: "0px", justifyContent: "center", width: "100%", maxWidth: "820px", margin: "0 auto", padding: "60px 20px 40px 20px", boxSizing: "border-box", alignItems: "start" }}>
        
        {/* FOTO E NOME A SINISTRA */}
        <div style={{ gridColumn: "1", gridRow: "1", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", paddingTop: "2px", paddingBottom: "0px" }}>
          <img src={rettangolo} alt="Marta Frittura" style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover", marginTop: "26px" }} />
          <div>
            <h3 style={{ fontSize: "15px", fontWeight: "700", color: "#111", margin: "0 0 1px 0" }}>Marta Frittura</h3>
            <span style={{ fontSize: "11px", color: "#666" }}>Project Manager</span>
          </div>
        </div>

        {/* CARD DESTRA */}
        <div style={{ gridColumn: "2", gridRow: "1 / span 5", background: "#ffffff", padding: "24px 32px", borderRadius: "16px", boxSizing: "border-box", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
          <div>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111", margin: "0 0 4px 0", lineHeight: "1.2" }}>
              Invita Marta<br />
              su Flowlee.
            </h1>
            {/* Testo descrittivo colorato esplicitamente di nero (#111) */}
            <p className="step31-card-text" style={{ fontSize: "13px", color: "#111", lineHeight: "1.4", margin: "0 0 14px 0" }}>
              La inseriremo nella tua organizzazione, una<br />
              volta che avrà accettato e compilato il test<br />
              cognitivo potrai aggiungerla ad un progetto.
            </p>

            <div style={{ marginTop: "16px" }}>
              <input 
                type="email" 
                value="marta.frittura@gmail.com" 
                readOnly 
                style={{ width: "230px", height: "36px", padding: "0 10px", background: "#f8f9fa", border: "1px solid #e1e1e6", borderRadius: "6px", color: "#333", fontSize: "13px", outline: "none", boxSizing: "border-box", marginLeft: "-190px" }}
              />
            </div>
          </div>

          <div style={{ marginTop: "45px", display: "flex", justifyContent: "flex-start" }}>
            <button 
              onClick={() => setDato(32)} 
              style={{ background: "#111", color: "#fff", border: "none", height: "36px", padding: "0 18px", borderRadius: "6px", fontSize: "13px", fontWeight: "600", cursor: "pointer", width: "auto"}}
            >
              Invita
            </button>
          </div>
        </div>

        {/* RIGHE DI SINISTRA (Persona, Contatti, Permessi, Orario) */}
        <div style={{ gridColumn: "1", gridRow: "2", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", height: "28px", padding: "0 10px", borderRadius: "6px", border: "1px solid #eaeaea", boxSizing: "border-box" }}>
          <span style={{ fontWeight: "500", color: "#333", fontSize: "12px" }}>Persona</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px" }}>✏️</span>
            <span style={{ color: "#10B981", fontWeight: "bold", fontSize: "11px" }}>✓</span>
          </div>
        </div>

        <div style={{ gridColumn: "1", gridRow: "3", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", height: "28px", padding: "0 10px", borderRadius: "6px", border: "1px solid #eaeaea", boxSizing: "border-box" }}>
          <span style={{ fontWeight: "500", color: "#333", fontSize: "12px" }}>Contatti</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px" }}>✏️</span>
            <span style={{ color: "#10B981", fontWeight: "bold", fontSize: "11px" }}>✓</span>
          </div>
        </div>

        <div style={{ gridColumn: "1", gridRow: "4", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", height: "28px", padding: "0 10px", borderRadius: "6px", border: "1px solid #eaeaea", boxSizing: "border-box" }}>
          <span style={{ fontWeight: "500", color: "#333", fontSize: "12px" }}>Permessi</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px" }}>✏️</span>
            <span style={{ color: "#10B981", fontWeight: "bold", fontSize: "11px" }}>✓</span>
          </div>
        </div>

        <div style={{ gridColumn: "1", gridRow: "5", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", height: "28px", padding: "0 10px", borderRadius: "6px", border: "1px solid #eaeaea", boxSizing: "border-box" }}>
          <span style={{ fontWeight: "500", color: "#333", fontSize: "12px" }}>Orario</span>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px" }}>✏️</span>
            <span style={{ color: "#10B981", fontWeight: "bold", fontSize: "11px" }}>✓</span>
          </div>
        </div>

      </div>
    </div>
  </div>
)}


{dato === 32 &&(
<div className="container-sfondo step10-mobile-fix">
    <img src={barra} className="siro" alt="Barra" />

    <div className="Step wide-mode">
      <div className="top-navigation">
        <div className="nav-left">
          <div className="arrows-container">
            <IoIosArrowDown className="top-icon" />
            <IoIosArrowUp className="top-icon" />
          </div>

          <div className="profilo-lavoro-container">
            <span>Company Srl / Orario</span>
          </div>
        </div>

        <div className="nav-center">
          <img 
            src={logoImage} 
            alt="Flowlee" 
            style={{ height: "20px", width: "auto" }} 
          />
        </div>

        <div className="right-icons">
          <BsGrid3X3Gap className="top-icon" />
          <HiOutlineUserCircle className="top-icon" />
        </div>
      </div>

      <div className="step10-content">
        <div className="step10-left">
          <div className="user-profile-header">
         
            </div>
          </div>

         
        </div>

        <div className="step10-right">
          <div className="invita-section">
            <h1>Genera <br /> un link veloce.</h1>
            <p>
              Chiunque entrerà con questo link avrà i <br />
              permessi preimpostati come a fianco
            </p>

            <div className="input-group">
              <input 
                type="email" 
                value="https://flowlee.inviteme/ADVFGF" 
                readOnly 
              />
            </div>

            <div className="step10-buttons">
              <button className="dark molo" onClick={() => setDato(33)}>
                Copia
              </button>
              <button  type = "sdh" className = "stop" >Rigenera</button>
            </div>
          </div>
  
          <div className = "trio">
            {[
              {T: "Piccola frase impersonale che descriva una dinamica"},
              {T: "Piccola frase impersonale che descriva una dinamica"},
              {T: "Piccola frase impersonale che descriva una dinamica"},
              {T: "Piccola frase impersonale che descriva una dinamica"}
            ].map((item,index) => (
              <div key = {index}>
                <label className = "kol">
                  <input type = "checkbox"/>
                  <span className = "jiu"/>
                </label>
                <div className = "aqwr">
                  <strong>{item.T}</strong>
                  </div> 
                  </div>
            ))}
            </div>
            


        </div>
      </div>
    </div>

)}
{dato === 33 &&(
  <div className="container-sfondo step10-mobile-fix">
  <img src={barra} className="siro" alt="Barra" />

  <div className="Step wide-mode">
    <div className="top-navigation">
      <div className="nav-left">
        <div className="arrows-container">
          <IoIosArrowDown className="top-icon" />
          <IoIosArrowUp className="top-icon" />
        </div>

        <div className="profilo-lavoro-container">
          <span>Company Srl / Persone</span>
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

    {/* Contenitore principale della schermata Persone */}
    <div style={{ width: "100%", maxWidth: "820px", margin: "0 auto", padding: "20px 20px", boxSizing: "border-box" }}>
      
      {/* Card principale con sfondo bianco e padding ottimizzato */}
      <div style={{ background: "#ffffff", padding: "24px 32px", borderRadius: "20px", boxSizing: "border-box", boxShadow: "0 10px 30px rgba(0,0,0,0.04)" }}>
        
        {/* Titolo principale */}
        <h1 style={{ fontSize: "22px", fontWeight: "700", color: "#111", margin: "0 0 12px 0" }}>
          Persone
        </h1>

        {/* Barra filtri (Mappa, Progetti, Gestisci, Cerca) */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", gap: "12px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={{ background: "#111", color: "#fff", border: "none", padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
              Mappa
            </button>
            <button style={{ background: "#f3f4f6", color: "#333", border: "none", padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>
              Progetti
            </button>
            <button style={{ background: "#f3f4f6", color: "#333", border: "none", padding: "5px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "500", cursor: "pointer" }}>
              Gestisci
            </button>
          </div>

          <div style={{ position: "relative" }}>
            <input 
              type="text" 
              placeholder="Cerca persona o progetto..." 
              style={{ width: "200px", height: "30px", padding: "0 12px 0 28px", background: "#f8f9fa", border: "1px solid #e1e1e6", borderRadius: "16px", fontSize: "11px", outline: "none", color: "#333" }}
            />
            <span style={{ position: "absolute", left: "10px", top: "7px", fontSize: "11px", color: "#999" }}>🔍</span>
          </div>
        </div>

        {/* SEZIONE IN ATTESA: 5 righe ancora più compatte per evitare qualsiasi taglio */}
      <div
  style={{
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    marginBottom: "8px",
  }}
>
<h3
  style={{
    fontSize: "12px",
    fontWeight: "600",
    color: "#666",
    margin: 0,
    marginLeft: "-290px", // sposta a sinistra
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  }}
>
  In attesa
</h3>

                   
  <h3
    style={{
      fontSize: "12px",
      fontWeight: "600",
      color: "#666",
      margin: 0,
      textTransform: "uppercase",
      letterSpacing: "0.5px",
      marginLeft: "-520px"
    }}
  >
    Attivi
  </h3>
</div>

          <div style={{ overflowX: "auto", paddingBottom: "4px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", width: "fit-content" }}>
              {[1, 2, 3, 4, 5].map((row) => (
                <div key={row} style={{ display: "flex", gap: "8px", flexWrap: "nowrap" }}>
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fcfcfc", border: "1px solid #eee", padding: "4px 10px", borderRadius: "6px", minWidth: "250px", boxSizing: "border-box" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <img src={rettangolo} alt="Marta Frittura" style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
                        <div>
                          <h4 style={{ fontSize: "11px", fontWeight: "600", color: "#111", margin: "0" }}>Marta Frittura</h4>
                          <span style={{ fontSize: "9px", color: "#666" }}>Project Manager</span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#666" }}>
                        <span style={{ cursor: "pointer", fontSize: "11px" }}>✏️</span>
                        <span style={{ cursor: "pointer", fontSize: "11px" }}>✕</span>
                      </div>
                    </div>

                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
         <button className = "isl" onClick = {() => setDato(34)}>
                      Vai
                    </button>
      </div>
    </div>
  </div>


)}
{dato == 34&&(

  <div className="container-sfondo modale-centrata-wrapper">
    <div className="Step wide-mode step27-mobile-fix modale-card">
      
      {/* (Barra superiore rimossa) */}

      {/* Titolo della modale */}
      <div className="modale-titolo-wrapper">
        <h2 className="modale-titolo-testo">
          Eliminare Marta Frrittura?
        </h2>
      </div>

      {/* Contenuto Principale */}
      <div className="step10-content modale-corpo">
        {/* COLONNA SINISTRA: Profilo Utente */}
        <div className="step10-right modale-col-sinistra">
          <div 
            className="w-full aspect-square flex flex-col items-center justify-center"
            style={{ backgroundColor: 'transparent', boxShadow: 'none', border: 'none' }}
          >
            <img
              src={rettangolo}
              className="img-box modale-avatar"
              alt="Profilo"
            />
            <h3 className="modale-nome">Marta Frrittura</h3>
            <p className="modale-ruolo">Project Manager</p>
          </div>
        </div>

        {/* Linea divisoria verticale */}
        <div className="modale-divisore"></div>

        {/* COLONNA DESTRA: Testi centrali e Bottoni */}
        <div className="step10-left modale-col-destra">
          <div className="space-y-4 modale-testi-box">
            
            {/* Testi informativi */}
            <div className="modale-avviso-container">
              <div className="modale-icona-punto">!</div>
              <div>
                <p className="modale-testo-principale">
                  Sei sicuro di voler eliminare Marta Frrittura dall'organizzazione?
                </p>
                <p className="modale-testo-secondario">
                  Qui ci scriviamo per bene tutte le conseguenze che ci sono eliminato il profilo relativamente a task, dipendenze e altro. Non so se in V.1 vogliamo già inserire un sostituto oppure se intanto eliminiamo e poi vediamo come automatizzare il resto.
                </p>
              </div>
            </div>

            {/* Bottoni di azione */}
            <div className="modale-bottoni-footer">
              <button type="button" className="cifralo" onClick={() => setDato(35)}>Conferma</button>
              <button type="button" className="cifra2">Annulla</button>
            </div>

          </div>
        </div>
      </div>

    </div>

    {/* (Barra inferiore rimossa) */}
  </div>

)}
{dato == 35 && (

  <div className="container-sfondo step10-mobile-fix step10-organizzazione">
    <div className="Step wide-mode">

```
  <div className="top-navigation">

    <div className="nav-left">
      <div className="arrows-container">
        <IoIosArrowDown className="top-icon" />
        <IoIosArrowUp className="top-icon" />
      </div>

      <div className="profilo-lavoro-container">
        <span>Company Srl / Persone</span>
      </div>
    </div>

    <div className="nav-center">
      <img
        src={logoImage}
        alt="Flowlee"
        style={{ height: "20px", width: "auto" }}
      />
    </div>

    <div className="right-icons">
      <BsGrid3X3Gap className="top-icon" />
      <HiOutlineUserCircle className="top-icon" />
    </div>

  </div>

  <div className="step10-content">

    {/* COLONNA SINISTRA */}
    <div className="step10-left">

      <h1 className="section-title titolo">
        Hai ricevuto un invito.<br />
        da Company Srl<br />
      </h1>

      <p className="step10-subtitle">
        Abbiamo soluzioni diverse per te.
      </p>

      <div className="step10-buttons">

        <button
          className="dark kid hh"
          onClick={() => setDato(36)}
        >
          Crea profilo
        </button>

        <button
          className="light kid hh"
          onClick={() => onSelectType("Freelance")}
        >
          Rifiuta
        </button>

      </div>

    </div>

    {/* COLONNA DESTRA - SOLO STEP 10 */}
    <div className="step10-right step10-invite-visuals">

      {/* LOGO PRIMA DI VIOLETTO */}
      <img
        src={ellissi}
        className="JDF step10-invite-logo"
        alt="Logo"
      />

      {/* VIOLETTO */}
      <img
        src={violetto}
        alt="Flowlee"
        className="step10-image step10-invite-violetto"
      />

    </div>

  </div>

  <img
    src={barra}
    className="siro"
    alt="Barra"
  />

</div>
```

  </div>
)}

{dato == 36 && (
  <div className="container-sfondo sfondo-scuro">
    <div className="Step wide-mode step27-mobile-fix">
      
      {/* Top Navigation MODIFICATA: Contiene ora anche il testo */}
      <div className="top-navigation" style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        
        {/* Riga superiore: Elementi originali della nav */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div className="nav-left">
            <div
              className="arrows-container"
              onClick={onBack}
              style={{ cursor: "pointer" }}
            >
              <IoIosArrowDown className="top-icon" />
              <IoIosArrowUp className="top-icon" />
            </div>

            <div className="profilo-lavoro-container">
              <span>Company srl / Persona</span>
            </div>
          </div>

          <div className="nav-center"></div>

          <div className="right-icons">
            <BsGrid3X3Gap className="top-icon" />
            <HiOutlineUserCircle className="top-icon" />
          </div>
        </div>

        
        <div
        className = "testo-modifica"
          style={{
            backgroundColor: "#1e1e1e",
            color: "#ffffff",
            padding: "8px 24px",
            fontSize: "13px",
            fontWeight: "500",
            width: "900px",
            boxSizing: 'border-box',
          }}
        >
          <span className="testo-interno">Stai modificando il profilo di Ilaria Frittura/</span>
        </div>

      </div>

     
      <div
        className="step10-content"
        style={{
          display: "flex",
          gap: "40px",
          alignItems: "center",
          justifyContent: "center",
          paddingTop: "40px",
          paddingBottom: "40px",
          marginLeft: "50px",
        }}
      >
        {/* COLONNA SINISTRA */}
        <div
          className="step10-right step27-photo-container"
          style={{ flex: "1", maxWidth: "300px" }}
        >
          <div style={{ marginTop: "-14px", fontWeight: "600", fontSize: "14px", color: "black" }}>
            Foto
          </div>
          <div 
            className="w-full flex flex-col items-center justify-center shadow-sm relative"
            style={{ 
              height: "290px", 
              backgroundColor: "#F1F1F9" ,
              marginTop: "2px"
            }}
          >
            <img
              src={rettangolo}
              className="img-box step27-photo"
              alt="Profilo"
              style={{ display: "none" }}
            />
            <img src={icona} className="mimi" alt="Icona" />
          </div>
        </div>

        {/* COLONNA DESTRA */}
        <div
          className="step10-left"
          style={{ flex: "1", maxWidth: "400px" }}
        >
          <div className="space-y-4">
            <div>
              <label className="rv">Nome</label>
              <br />
              <input
                type="text"
                className="li"
                placeholder="Inserisci nome"
              />
            </div>

            <div
              style={{
                color: "black",
                transform: "translateY(-13px)",
              }}
            >
              <label className="gv">Cognome</label>
              <br />
              <input
                className="nnnn"
                placeholder="Frittura"
                style={{ color: "black" }}
              />

              <div className="justify-center">
                <div className="noi">
                  <label className="jes">Ruoli</label>
                  <div className="klo">
                    <select>
                      <option>Project Manager</option>
                      <option>Sviluppatore</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ color: "black" }}>
              <label className="batma">Overview</label>
              <br />
              <textarea
                className="luc"
                placeholder="Descrizione"
              />
              
            
              <button
                className="jj"
                onClick={() => setDato(37)}
              >
                Procedi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <img
      src={barra}
      className="siro"
      alt="Barra"
    />
  </div>
)}


{dato == 37&&(





  <div className="container-sfondo step10-mobile-fix step10-organizzazione">
    <div className="Step wide-mode">

```
  <div className="top-navigation">

    <div className="nav-left">
      <div className="arrows-container">
        <IoIosArrowDown className="top-icon" />
        <IoIosArrowUp className="top-icon" />
      </div>

      <div className="profilo-lavoro-container">
        <span>Company Srl / Persone</span>
      </div>
    </div>

    <div className="nav-center">
      <img
        src={logoImage}
        alt="Flowlee"
        style={{ height: "20px", width: "auto" }}
      />
    </div>

  
    <div className="right-icons">
      <BsGrid3X3Gap className="top-icon" />
      <HiOutlineUserCircle className="top-icon" />
    </div>
  

  </div>

  <div className="step10-content">

    {/* COLONNA SINISTRA */}
    <div className="step10-left">

      

      <div className="step10-buttons">

              <img
                src={group}
                alt="Marta"
                className="marta"
              />
        

       <div className = "chies">
   <h1>Come puoi <br /> 
   essere  contattata?</h1>
   
   <div className = "adsn">
   <span>Selezionerai la visibilità <br /> 
   dei dati di contatto piu avanti</span>
   </div>
   </div>

  <div className = "orso">
  <label className = "ioyes">Intranet</label>
  <input type = "text" className = "jgsd" placeholder = "Inserire indirizzo"></input>
   <label className = "ioyes">Email</label>
  <input type = "text" className = "jgsd" placeholder = "Inserire email"></input>
   <label className = "ioyes">Whatsapp</label>
  <input type = "text" className = "jgsd" placeholder = "Inserire email"></input>
  </div>

 

 


      </div>

    </div>

    {/* COLONNA DESTRA - SOLO STEP 10 */}
    <div className="step10-right step10-invite-visuals">

     
 <button className = "buio" onClick = {() => setDato(38)}>
    Procedi
  </button>
  <button className = "Casa">Salta</button>
      

    </div>

  </div>

  <img
    src={barra}
    className="siro"
    alt="Barra"
  />

</div>
```

  </div>
)}

{dato === 38 &&(


  <div className="container-sfondo step10-mobile-fix step10-organizzazione ">
    <div className="Step wide-mode">

```
  <div className="top-navigation">

    <div className="nav-left">
      <div className="arrows-container">
        <IoIosArrowDown className="top-icon" />
        <IoIosArrowUp className="top-icon" />
      </div>

      <div className="profilo-lavoro-container">
        <span>Company Srl / Persone</span>
      </div>
    </div>

    <div className="nav-center">
      <img
        src={logoImage}
        alt="Flowlee"
        style={{ height: "20px", width: "auto" }}
      />
    </div>

  
    <div className="right-icons">
      <BsGrid3X3Gap className="top-icon" />
      <HiOutlineUserCircle className="top-icon" />
    </div>
  

  </div>

  <div className="step10-content">

    {/* COLONNA SINISTRA */}
    <div className="step10-left">

      

      <div className="step10-buttons">

              <img
                src={group}
                alt="Marta"
                className="marta"
              />
        

       <div className = "chies">
   <h1>Questi sono <br /> 
  i tuoi permessi?</h1>
   
   <div className = "adsn3">
   <span>Sono impostati dal tuo referente <br /> 
   Contattalo se non ti torna qualcosa</span>
   </div>
   </div>

  
   
 

 


      </div>

    </div>

    {/* COLONNA DESTRA - SOLO STEP 10 */}
    <div className="step10-right step10-invite-visuals">

      <div className = "mik">
    {[
      {T: "Piccola frase impersonale che descriva una dinamica"},
      {T: "Piccola frase impersonale che descriva una dinamica",
       D: "Orario gestito dal dipendente per obiettivi,attività e disponibilità"},
      {T: "Piccola frase impersonale che descriva una dinamica"},
      {T: "Piccola frase impersonale che descriva una dinamica"}
    ].map((item,index) => (
      <div key = {index}>
        <label className = "iuj">
          <input type = "checkbox"/>
          <span className = "fjh"/>
        </label>
        <div className = "mimmo">
          <strong>{item.T}</strong>
          <strong className = "descrizione-item">{item.D}</strong>
          </div>
          </div>
    ))}
    </div>

     
 <button className = "mimo" onClick = {() => setDato(39)}>
    Ok Procedi
  </button>
      

    </div>

  </div>

  <img
    src={barra}
    className="siro"
    alt="Barra"
  />

</div>
```

  </div>
)}

{dato === 39 && (
        <div className="container-sfondo step10-mobile-fix">
          <img src={barra} className="siro" alt="Barra" />

          <div className="Step wide-mode">
            {/* Header identico alla schermata 26 */}
            <div className="top-navigation">
              <div className="nav-left">
                <div className="arrows-container">
                  <IoIosArrowDown className="top-icon" />
                  <IoIosArrowUp className="top-icon" />
                </div>

                <div className="profilo-lavoro-container">
                  <span>Company srl / Permessi</span>
                </div>
              </div>

              <div className="nav-center">
                <img src={logoImage} alt="Logo" style={{ height: "20px", width: "auto" }} />
              </div>

              <div className="right-icons">
                <BsGrid3X3Gap className="top-icon" />
                <HiOutlineUserCircle className="top-icon" />
              </div>
            </div>

            {/* Contenitore principale allineato al layout corretto */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "600px", margin: "0 auto", padding: "40px 20px", boxSizing: "border-box" }}>
              
              {/* Sezione Sinistra/Superiore: Foto, Titolo e Sottotitolo */}
              <div style={{ width: "100%", maxWidth: "500px", marginBottom: "24px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                
                {/* Foto Marta */}
                <div className="foto-wrapper step29-foto" style={{ marginBottom: "16px" }}>
                  <img
                    src={group}
                    alt="Marta"
                    className="foto-marta"
                    style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
                  />
                </div>

                {/* Titolo e Sottotitolo */}
                <div className="er step39-titolo" style={{ textAlign: "left", width: "100%" }}>
                  <h1 style={{ fontSize: "28px", fontWeight: "700", color: "#111", margin: "0 0 10px 0", lineHeight: "1.2" }}>
                    Questi sono<br />
                    i tuoi orari
                  </h1>

                  <span style={{ fontSize: "13px", color: "#666", lineHeight: "1.4", display: "block" }}>
                    Sono impostati dal tuo referente.<br />
                    Contattalo se non ti torna qualcosa.
                  </span>
                </div>

              </div>

              {/* Box Info Orario */}
              <div className="info-orario-box" style={{ width: "100%", maxWidth: "500px", marginBottom: "20px" }}>
                <div className="info-orario-icon">
                  <div className="company-logo-placeholder">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M10 6H6C4.89543 6 4 6.89543 4 8V18C4 19.1046 4.89543 20 6 20H16C17.1046 20 18 19.1046 18 18V14"
                        stroke="#0052FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                      <path
                        d="M14 4H18V8"
                        stroke="#0052FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M10 14L18 6"
                        stroke="#0052FF"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>

                <div className="info-orario-content">
                  <strong>
                    Il tuo orario è gestito secondo quello di Company Srl.
                  </strong>
                  <p>Lun-Ven, modello flessibile, minimo 6h.</p>
                  <p>Fascia oraria 07:00-21:00.</p>
                </div>
              </div>

              {/* Lista Permessi con interruttore sicuro e visibile */}
              <div className="cifra step39-permessi" style={{ width: "100%", maxWidth: "500px", marginBottom: "20px" }}>
                <div className="riga-permesso" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  <label className="guf" style={{ position: "relative", display: "inline-block", width: "44px", height: "24px", minWidth: "44px", cursor: "pointer", flexShrink: 0, margin: 0 }}>
                    <input type="checkbox" style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
                    <span className="loui" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#cbd5e1", borderRadius: "24px", transition: "0.3s", display: "block" }}>
                      <span style={{ position: "absolute", height: "18px", width: "18px", left: "3px", bottom: "3px", backgroundColor: "white", borderRadius: "50%", transition: "0.3s", display: "block" }} />
                    </span>
                  </label>

                  <div className="tutto">
                    <strong style={{ fontSize: "14px", color: "#111", display: "block" }}>Gestione autonoma parziale dell'orario</strong>
                    <p style={{ fontSize: "12px", color: "#666", margin: "2px 0 0 0" }}>Permetti a Marta di gestire l'orario in autonomia</p>
                  </div>
                </div>
              </div>

              {/* Bottoni giorni della settimana */}
              <div className="aqua step39-giorni" style={{ display: "flex", gap: "8px", marginBottom: "30px", width: "100%", maxWidth: "500px", justifyContent: "flex-start" }}>
                {["L", "M", "M", "G", "V", "S", "D"].map((j, k) => (
                  <button key={k} className="ryy">
                    {j}
                  </button>
                ))}
              </div>

              {/* Bottone Procedi */}
              <button
                className="butt step39-butt"
                onClick={() => setDato(40)}
                style={{ background: "#111", color: "#fff", border: "none", height: "46px", width: "100%", maxWidth: "500px", borderRadius: "24px", fontSize: "14px", fontWeight: "600", cursor: "pointer" }}
              >
                Ok entra in flowlee!
              </button>

            </div>

          </div>
        </div>
      )}
    
  
    
  

    


    </div>
  );
}

export default App;