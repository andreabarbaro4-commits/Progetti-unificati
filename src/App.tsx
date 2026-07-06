
  import { useState } from 'react';
import './App.css';

import avatar from './assets/avatar.png';
import avatar3 from './assets/avatar3.png';
import profilo from './assets/profilo.png';
import { FaSearch } from "react-icons/fa";
import logoImage from './assets/Logo.png';
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { HiOutlineUserCircle } from "react-icons/hi2";
import { BsGrid3X3Gap } from "react-icons/bs";
import { Button } from './components/ui/Button';
import omino from './assets/omino.png';

const ruoli = [
  "Project Manager",
  "Ux Designer",
  "UI Designer",
  "Hr Manager",
  "Troll",
  "Data Analyst",
  "Dog Sitter",
];

export type OrgType = 'Azienda' | 'Freelance';

function App() {
  const [dato, setDato] = useState(1);
  const [ruoloSelezionato, setRuoloSelezionato] = useState<string | null>(null);

  const [orgType, setOrgType] = useState<OrgType | null>(null);

  const [values, setValues] = useState({
    companyName: "",
    teamSize: "1-10",
    description: "",
  });

  const poi = ["Project manager", "Hr Manager", "Dog Sitter"];

  const fieldClasses =
    "w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600";

  const onSelectType = (type: OrgType) => {
    setOrgType(type);
    setDato(11);
  };

  const onBack = () => {
    setDato(10);
  };

  const onChange = (data: Partial<typeof values>) => {
    setValues((prev) => ({ ...prev, ...data }));
  };
  const [prezzo, setPrezzo] = useState("€50/mese")


  return (
    <div className="App">
      
      {/* Step 1 */}
      {dato === 1 && (
        <div className = "container-sfondo">
        <div className="Step">
          <div className="logo">
            <img src = {logoImage} alt = "Flowlee" style = {{height: '20px',width: 'auto'}} />
          <h1 className = "section-title">
            Benvenuto!<br />Raccontaci chi sei.</h1>
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
            Successivo
          </button>
 
          </div>

     


        
          </div>
          </div>
      )}

     {/* Step 2 */}
{dato === 2 && (
  <div className="container-sfondo">
    <div className="Step">
      <div className="logo">
        <img src={logoImage} alt="Flowlee" style={{ height: '20px', width: 'auto' }} />
      </div>
      
      {/* Contenitore che gestisce il layout flessibile */}
      <div className="Step-inner-container">
        <h1 className = "section-title">
        Ciao Marco!<br />Creiamo l'account.</h1>
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
        
        {/* Il margin-top: auto del CSS lo spingerà in fondo */}
        <button className="de" onClick={() => setDato(3)}>
          Successivo
        </button>
      </div>
      
    </div>
  </div>

      )}

      {/* Step 3 */}
      {dato === 3 && (
        <div className = "container-sfondo">
        <div className="Step">
          <div className="logo">
           <img src = {logoImage} alt = "Flowlee" style = {{height: '20px',width: 'auto'}} />
          <img src={avatar} alt="avatar" className="avatar" />
          <h1 className = "section-title" >
          Sto inviando <br /> il codice di verifica.</h1>
          <button className="de" onClick={() => setDato(4)}>Successivo</button>
        </div>
        </div>
        </div>
      )}

      {/* Step 4 */} 
      {dato === 4 && (
        <div className = "container-sfondo">
        <div className="Step">
          <div className="logo">
             <img src = {logoImage} alt = "Flowlee" style = {{height: '20px',width: 'auto'}} />
          <h1 className = "section-title">
            Inserisci il codice<br />che trovi sulla mail!</h1>
          <p style={{marginBottom: '20px', color: '#666', fontSize: '14px'}}>mariorossi@gmail.com</p>
          <div className="input-group">
            <label>Codice</label>
            <input type="text" placeholder="Inserisci codice"/>
          </div>
          <button className="WE">Invia di nuovo</button>
          <button className="era" onClick={() => setDato(5)}>Conferma</button>
        </div>
        </div>
        </div>
      )}

     {/* Step 5 */}
{dato === 5 && (
  <div className="container-sfondo">
    <div className="Step">
      <img src={avatar3} alt="avatar3" className="avatar3" />
      <div>
        <h1 className = "section-title">
          Piacere Flowlee! <br />Benvenuto. Creiamo il tuo profilo?</h1>
      </div>
      <div className="hey">
        <button className="wr" onClick={() => setDato(6)}>Crea profilo</button>
      </div>
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
            <div className="nav-center">
               <img src = {logoImage} alt = "Flowlee" style = {{height: '20px',width: 'auto'}} />
            <div className="right-icons">
              <BsGrid3X3Gap className="top-icon" />
              <HiOutlineUserCircle className="top-icon" />
            </div>
          </div>
          </div>


          <h1 className = "section-title">
          Benvenuto!<br />Raccontaci chi sei</h1>

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
               <img src = {logoImage} alt = "Flowlee" style = {{height: '20px',width: 'auto'}} />
            </div>
         
            <div className="right-icons">
              <BsGrid3X3Gap className="top-icon" />
              <HiOutlineUserCircle className="top-icon" />
            </div>
          </div>
          
          <h1 className = "section-title">
            Che lavoro fai?</h1>
          
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
        <div className="container-sfondo">
          <div className="Step step-header-layout">
            {/* Barra di navigazione uniformata */}
            <div className="top-navigation">
              <div className="nav-left">
                <div className="arrows-container">
                  <IoIosArrowDown className="top-icon" />
                  <IoIosArrowUp className="top-icon" />
                </div>
                <div className="profilo-lavoro-container">
                  <span>Profilo/Foto</span>
                </div>
              </div>

              <div className="nav-center">
                <img src={logoImage} alt="Flowlee" style={{ height: '20px', width: 'auto' }} />
              </div>

              <div className="right-icons">
                <BsGrid3X3Gap className="top-icon" />
                <HiOutlineUserCircle className="top-icon" />
              </div>
            </div>

            {/* Contenuto dello step */}
            <div className="we">
              <h1 className="section-title">Carica una foto!</h1>

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
              <img src={avatar3} alt="avatar" className="avatar-decorativo" />

              <div className="rt">
                <button className="qa btn-bianco" onClick={() => setDato(9)}>
                  Inizia
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      
{/* Step 9 */}
      {dato === 9 && (
        <div className="container-sfondo">
          <div className="Step step-header-layout">
            <div className="top-navigation">
              <div className="nav-left">
                <div className="arrows-container">
                  <IoIosArrowDown className="top-icon" />
                  <IoIosArrowUp className="top-icon" />
                </div>
                <div className="profilo-lavoro-container">
                  <span>Profilo/Foto</span>
                </div>
              </div>
              <div className="nav-center">
                <img src={logoImage} alt="Flowlee" style={{ height: '20px', width: 'auto' }} />
              </div>
              <div className="right-icons">
                <BsGrid3X3Gap className="top-icon" />
                <HiOutlineUserCircle className="top-icon" />
              </div>
            </div>

            <div className="we">
              <h1 className="section-title">Carica una foto!</h1>
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
              <img src={avatar3} alt="avatar" className="avatar-decorativo" />
              <div className="rt">
                <button className="qa" onClick={() => setDato(10)}>Inizia</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 10 */}
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
                  <Button variant="dark" onClick={() => setDato(11)}>Company</Button>
                  <Button variant="light" onClick={() => onSelectType("Freelance")}>Freelance</Button>
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
        <div className="container-sfondo">
          <div className="Step step-header-layout step10-layout">
            <div className="top-navigation">
              <div className="nav-left">
                <div className="arrows-container" onClick={onBack} style={{ cursor: 'pointer' }}>
                  <IoIosArrowDown className="top-icon" />
                  <IoIosArrowUp className="top-icon" />
                </div>
                <div className="profilo-lavoro-container">
                  <span>Organizzazione / 2</span>
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
                <div className="w-full aspect-square border border-gray-200 rounded-3xl flex flex-col items-center justify-center bg-white shadow-sm">
                  <span className="font-bold text-gray-800 text-lg">LOGO</span>
                </div>
              </div>
              <div className="step10-left" style={{ flex: '1', maxWidth: '400px' }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome dell'azienda</label>
                    <input className={fieldClasses} placeholder="Company Srl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Grandezza team</label>
                    <div className="flex gap-2">
                      <select className={fieldClasses} onChange={(e) => {
                        const val = e.target.value;
                        const prezzi: Record<string, string> = {
                          "1-5": "€29/mese", "6-10": "€49/mese", "11-20": "€89/mese",
                          "21-50": "€149/mese", "51-100": "€249/mese", "101-250": "€449/mese", "250+": "Custom"
                        };
                        setPrezzo(prezzi[val] || "Contattaci");
                      }}>
                        <option value="1-5">1-5 persone</option>
                        <option value="6-10">6-10 persone</option>
                        <option value="11-20">11-20 persone</option>
                        <option value="21-50">21-50 persone</option>
                        <option value="51-100">51-100 persone</option>
                        <option value="101-250">101-250 persone</option>
                        <option value="250+">250+ persone</option>
                      </select>
                      <div className="px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-sm flex items-center whitespace-nowrap font-medium text-gray-700 min-w-[100px] justify-center">
                        {prezzo}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
                    <div className="flex gap-4 items-end">
                      <textarea className={`${fieldClasses} h-24`} placeholder="Descrivi l'azienda..." />
                      <button className="bg-black text-white px-8 py-3 rounded-xl font-medium text-sm whitespace-nowrap" onClick={() => setDato(12)}>
                        Procedi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


   {dato === 12 && (
  <div className="container-sfondo">
    <div className="Step step-header-layout step10-layout" style={{ padding: '40px', maxWidth: '900px', margin: 'auto' }}>
      
      {/* Titolo della sezione */}
      <h1 className="text-xl font-bold mb-6">Impostazioni azienda</h1>

      {/* Contenitore a 3 colonne */}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        
        {/* 1. Colonna Sidebar: Bottoni */}
        <div style={{ flex: '0 0 200px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button className="bg-black text-white p-3 rounded-xl text-sm text-left">Dettagli dell'azienda</button>
          <button className="bg-white border border-gray-200 p-3 rounded-xl text-sm text-left hover:bg-gray-50">Modifica amministratori</button>
          <button className="bg-white border border-gray-200 p-3 rounded-xl text-sm text-left hover:bg-gray-50">Contatti aziendali</button>
          <button className="bg-white border border-gray-200 p-3 rounded-xl text-sm text-left hover:bg-gray-50">Fatturazione e pagamento</button>
          <button className="bg-white border border-gray-200 p-3 rounded-xl text-sm text-left hover:bg-gray-50">Modello e orario di lavoro</button>
        </div>

        {/* 2. Colonna Centrale: Logo */}
        <div style={{ flex: '0 0 200px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div className="w-full aspect-square border border-gray-200 rounded-3xl flex flex-col items-center justify-center bg-white shadow-sm">
            <span className="font-bold text-gray-800">LOGO</span>
          </div>
        </div>

        {/* 3. Colonna Destra: Form */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome dell'azienda</label>
            <input className={fieldClasses} placeholder="Company Srl" />
          </div>
         
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Grandezza team</label>
            <div className="flex gap-2">
              <select className={fieldClasses} onChange={(e) => { /* logica prezzi */ }}>
                <option>30-50 persone</option>
              </select>
              <div className="px-4 py-3 border border-gray-300 rounded-xl bg-gray-50 text-sm flex items-center">€200/mese</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrizione</label>
            <textarea className={`${fieldClasses} h-24`} placeholder="Descrivi l'azienda..." />
          </div>

          <div className="flex justify-end">
            <button className = "tre"  onClick={() => setDato(12)}>
              Salva
            </button>

            
          </div>
        </div>

      </div>
    </div>
  </div>
)}
</div>
  );
}

export default App;