import { useState, useEffect, useRef } from "react";

// ─── Fonts ─────────────────────────────────────────────────────────────────
const injectFonts = () => {
  if (document.querySelector("#pt-fonts")) return;
  const l = document.createElement("link"); l.id = "pt-fonts"; l.rel = "stylesheet";
 l.href = "https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&display=swap";};
document.head.appendChild(l);
// ─── Design tokens ─────────────────────────────────────────────────────────
const T = {
  red: "#C8102E", redLight: "#FFF0F2", redMid: "#F5D0D7",
  black: "#111111", dark: "#1E1E1E", charcoal: "#444444",
  grey: "#888888", lightGrey: "#CCCCCC", border: "#E8E8E8",
  bg: "#FFFFFF", bgOff: "#F7F7F7", bgPanel: "#FAFAFA",
  sidebar: "#111111", sidebarText: "#AAAAAA", sidebarActive: "#FFFFFF",
};

// ─── Storage ───────────────────────────────────────────────────────────────
const store = {
  get: async (k) => { try { const r = await window.storage.get(k); return r ? JSON.parse(r.value) : null; } catch { return null; } },
  set: async (k, v) => { try { await window.storage.set(k, JSON.stringify(v)); } catch {} },
  del: async (k) => { try { await window.storage.delete(k); } catch {} },
};

// ─── Body SVG Diagram ──────────────────────────────────────────────────────
const MUSCLE_MAP = {
  "chest-l":["pectoralis","ngực","chest"],"chest-r":["pectoralis","ngực","chest"],
  "front-delt-l":["anterior deltoid","vai trước","deltoid"],"front-delt-r":["anterior deltoid","vai trước","deltoid"],
  "mid-delt-l":["medial deltoid","vai giữa"],"mid-delt-r":["medial deltoid","vai giữa"],
  "rear-delt-l":["posterior deltoid","vai sau"],"rear-delt-r":["posterior deltoid","vai sau"],
  "bicep-l":["biceps","brachialis","tay trước"],"bicep-r":["biceps","brachialis","tay trước"],
  "tricep-l":["triceps","tam đầu"],"tricep-r":["triceps","tam đầu"],
  "abs":["abdominal","rectus","core","lõi","bụng","serratus","oblique","transverse"],
  "lat-l":["latissimus","lưng xô","xô","teres major"],"lat-r":["latissimus","lưng xô","xô","teres major"],
  "trap-l":["trapezius","rhomboid","cơ giữa lưng"],"trap-r":["trapezius","rhomboid"],
  "rhomboid":["rhomboid","infraspinatus","teres minor"],
  "lower-back":["erector spinae","lưng dưới","lower back"],
  "glute-l":["gluteus","mông","glute"],"glute-r":["gluteus","mông","glute"],
  "quad-l":["quadricep","đùi trước","adductor"],"quad-r":["quadricep","đùi trước","adductor"],
  "ham-l":["hamstring","đùi sau"],"ham-r":["hamstring","đùi sau"],
  "calf-l":["gastrocnemius","soleus","bắp chân","calves"],"calf-r":["gastrocnemius","soleus","bắp chân","calves"],
};
const FRONT_IDS = ["chest-l","chest-r","front-delt-l","front-delt-r","mid-delt-l","mid-delt-r","bicep-l","bicep-r","abs","quad-l","quad-r","calf-l","calf-r"];
const BACK_IDS  = ["rear-delt-l","rear-delt-r","tricep-l","tricep-r","lat-l","lat-r","trap-l","trap-r","rhomboid","lower-back","glute-l","glute-r","ham-l","ham-r","calf-l","calf-r"];
const SHAPES = {
  "chest-l":{v:"front",el:"ellipse",cx:68,cy:83,rx:18,ry:14},"chest-r":{v:"front",el:"ellipse",cx:112,cy:83,rx:18,ry:14},
  "front-delt-l":{v:"front",el:"ellipse",cx:38,cy:67,rx:13,ry:10},"front-delt-r":{v:"front",el:"ellipse",cx:142,cy:67,rx:13,ry:10},
  "mid-delt-l":{v:"front",el:"ellipse",cx:32,cy:78,rx:10,ry:8},"mid-delt-r":{v:"front",el:"ellipse",cx:148,cy:78,rx:10,ry:8},
  "bicep-l":{v:"front",el:"ellipse",cx:28,cy:103,rx:9,ry:19},"bicep-r":{v:"front",el:"ellipse",cx:152,cy:103,rx:9,ry:19},
  "abs":{v:"front",el:"rect",x:70,y:100,w:40,h:52,rx:6},
  "quad-l":{v:"front",el:"ellipse",cx:65,cy:213,rx:16,ry:34},"quad-r":{v:"front",el:"ellipse",cx:115,cy:213,rx:16,ry:34},
  "calf-l":{v:"front",el:"ellipse",cx:62,cy:280,rx:11,ry:24},"calf-r":{v:"front",el:"ellipse",cx:118,cy:280,rx:11,ry:24},
  "rear-delt-l":{v:"back",el:"ellipse",cx:38,cy:67,rx:13,ry:10},"rear-delt-r":{v:"back",el:"ellipse",cx:142,cy:67,rx:13,ry:10},
  "tricep-l":{v:"back",el:"ellipse",cx:27,cy:103,rx:9,ry:20},"tricep-r":{v:"back",el:"ellipse",cx:153,cy:103,rx:9,ry:20},
  "lat-l":{v:"back",el:"ellipse",cx:57,cy:103,rx:17,ry:28},"lat-r":{v:"back",el:"ellipse",cx:123,cy:103,rx:17,ry:28},
  "trap-l":{v:"back",el:"ellipse",cx:68,cy:70,rx:20,ry:13},"trap-r":{v:"back",el:"ellipse",cx:112,cy:70,rx:20,ry:13},
  "rhomboid":{v:"back",el:"ellipse",cx:90,cy:95,rx:16,ry:18},
  "lower-back":{v:"back",el:"ellipse",cx:90,cy:138,rx:22,ry:14},
  "glute-l":{v:"back",el:"ellipse",cx:67,cy:178,rx:22,ry:19},"glute-r":{v:"back",el:"ellipse",cx:113,cy:178,rx:22,ry:19},
  "ham-l":{v:"back",el:"ellipse",cx:65,cy:220,rx:16,ry:32},"ham-r":{v:"back",el:"ellipse",cx:115,cy:220,rx:16,ry:32},
};
const getIds = (text) => { if(!text) return []; const t=text.toLowerCase(); return Object.entries(MUSCLE_MAP).filter(([,kws])=>kws.some(k=>t.includes(k))).map(([id])=>id); };

const BodySVG = ({ view, primaryIds, secondaryIds }) => {
  const front = view==="front";
  return (
    <svg viewBox="0 0 180 340" width={150} height={283} style={{display:"block"}}>
      {/* Body silhouette */}
      <ellipse cx="90" cy="22" rx="16" ry="19" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <rect x="83" y="40" width="14" height="12" rx="3" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <ellipse cx="38" cy="67" rx="15" ry="12" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <ellipse cx="142" cy="67" rx="15" ry="12" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <rect x="53" y="54" width="74" height="96" rx="11" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <rect x="19" y="52" width="21" height="58" rx="9" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <rect x="140" y="52" width="21" height="58" rx="9" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <rect x="14" y="111" width="17" height="44" rx="7" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <rect x="149" y="111" width="17" height="44" rx="7" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <rect x="53" y="150" width="74" height="22" rx="9" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <rect x="49" y="170" width="33" height="72" rx="11" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <rect x="98" y="170" width="33" height="72" rx="11" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <rect x="53" y="244" width="25" height="56" rx="9" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <rect x="102" y="244" width="25" height="56" rx="9" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <ellipse cx="65" cy="306" rx="17" ry="7" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      <ellipse cx="115" cy="306" rx="17" ry="7" fill="#E8E8E8" stroke="#D0D0D0" strokeWidth="1"/>
      {/* Muscle highlights */}
      {(front ? FRONT_IDS : BACK_IDS).map(id => {
        const s = SHAPES[id]; if(!s) return null;
        const isPrimary = primaryIds.includes(id), isSecondary = secondaryIds.includes(id);
        if(!isPrimary && !isSecondary) return null;
        const p = s.el==="ellipse" ? {cx:s.cx,cy:s.cy,rx:s.rx,ry:s.ry} : {x:s.x,y:s.y,width:s.w,height:s.h,rx:s.rx};
        const El = s.el;
        return <El key={id} {...p} fill={T.red} opacity={isPrimary?0.88:0.32} style={isPrimary?{filter:`drop-shadow(0 0 4px ${T.red}60)`}:{}} />;
      })}
      <text x="90" y="334" textAnchor="middle" fill="#BBBBBB" fontSize="8" fontFamily=>"Be Vietnam Pro"front?"TRƯỚC":"SAU"}</text>
    </svg>
  );
};

const BodyDiagram = ({ ex }) => {
  const primaryIds = getIds(ex.primaryMuscle), secondaryIds = getIds(ex.secondaryMuscles);
  return (
    <div style={{display:"flex",gap:24,alignItems:"center",justifyContent:"center",padding:"16px 0"}}>
      {["front","back"].map(v => (
        <div key={v} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,padding:"16px 12px",background:T.bgOff,borderRadius:12,border:`1px solid ${T.border}`}}>
          <BodySVG view={v} primaryIds={primaryIds} secondaryIds={secondaryIds} />
        </div>
      ))}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:14,height:14,borderRadius:3,background:T.red,opacity:0.88}}/><span style={{color:T.charcoal,fontSize:12,fontFamily:"Be Vietnam Pro"}}>Cơ chính</span></div>
        <div style={{display:"flex",alignItems:"center",gap:8}}><div style={{width:14,height:14,borderRadius:3,background:T.red,opacity:0.32}}/><span style={{color:T.grey,fontSize:12,fontFamily:"Be Vietnam Pro"}}>Cơ phụ</span></div>
      </div>
    </div>
  );
};

// ─── Exercise Data ─────────────────────────────────────────────────────────
const EX = [
  {id:1,name:"Lat Pulldown",vi:"Kéo Xô Lưng",primary:"Latissimus dorsi (lưng xô)",secondary:"Biceps, Posterior deltoid, Trapezius, Teres major",eq:"Máy kéo xô",phase:"Strength / Hypertrophy",cat:"LƯNG",sets:"3–4",reps:"8–12",tempo:"2–0–2",rest:"60–90s",level:"Cơ bản – Trung bình",goal:"Phát triển lưng xô, tăng sức kéo, cải thiện độ rộng lưng",setup:["Ngồi thẳng, đùi cố định dưới thanh chặn","Nắm rộng hơn vai, lòng bàn tay hướng ra ngoài","Ngực mở, vai kéo xuống, lưng thẳng"],exec:["Kéo thanh về phía ngực trên bằng cách đưa khuỷu xuống hông","Xiết lưng xô ở cuối biên độ","Thả từ từ lên kiểm soát hoàn toàn"],breath:"Hít vào khi thả lên. Thở ra khi kéo xuống.",mistakes:[{w:"Ngả người quá mức ra sau",f:"Giữ thân thẳng 10–15°, ngực mở hướng lên"},{w:"Kéo bằng tay trước quá nhiều",f:"Tư duy 'khuỷu về hông' — xô kéo, tay chỉ giữ"},{w:"Rướn cổ, cằm chìa ra",f:"Giữ cổ trung lập, mắt nhìn thẳng"}],cues:"Ngực mở → vai xuống → khuỷu về hông → xiết xô → thả kiểm soát",alts:["Band pulldown","Seated cable row","Assisted pulldown"],subs:["Assisted pull-up","Pull-up","TRX row"]},
  {id:2,name:"Barbell Back Squat",vi:"Squat Tạ Đòn",primary:"Quadriceps (đùi trước)",secondary:"Gluteus maximus, Hamstrings, Core, Calves, Adductor",eq:"Power Rack + Tạ đòn Olympic",phase:"Strength / Power",cat:"CHÂN",sets:"3–5",reps:"5–8",tempo:"3–0–1",rest:"90–120s",level:"Trung bình – Nâng cao",goal:"Tăng sức mạnh toàn thân, phát triển khối cơ chân mông",setup:["Thanh tạ ngang bẫy vai sau, chân rộng bằng vai","Mũi chân xoay ngoài 15–30°, ngực ưỡn, siết lõi","Nhìn thẳng về phía trước"],exec:["Break hông và gối đồng thời — hạ như ngồi về ghế sau lưng","Giữ gối theo hướng mũi chân, không đổ vào trong","Đẩy mạnh qua gót chân, hông và vai đồng thời đứng dậy"],breath:"Hít sâu trước khi hạ (Valsalva). Thở ra vượt sticking point.",mistakes:[{w:"Knee valgus — gối đổ vào trong",f:"Đẩy gối ra ngoài chủ động, tư duy 'ép sàn ra ngoài'"},{w:"Gót chân nhấc lên",f:"Kéo giãn Achilles, dùng miếng nêm tạm thời"},{w:"Lưng dưới tròn (butt wink)",f:"Giảm độ sâu, cải thiện hip mobility"}],cues:"Ngực ưỡn → siết lõi → gối theo mũi chân → ngồi về sau xuống → đẩy từ gót",alts:["Goblet squat","Box squat","Leg press"],subs:["Bulgarian split squat","Hack squat","Front squat"]},
  {id:3,name:"Romanian Deadlift",vi:"Deadlift Romania",primary:"Hamstrings (đùi sau)",secondary:"Gluteus maximus, Erector spinae, Core, Adductor",eq:"Tạ đòn hoặc tạ đôi",phase:"Strength / Hypertrophy",cat:"CHÂN / LƯNG",sets:"3–4",reps:"8–12",tempo:"3–1–2",rest:"60–90s",level:"Trung bình",goal:"Phát triển đùi sau và mông, cải thiện tư thế, tăng mobility posterior chain",setup:["Đứng thẳng, chân rộng bằng hông, overhand grip","Vai kéo ra sau xuống, ngực ưỡn, cổ trung lập","Khóa gối nhẹ, không duỗi thẳng hoàn toàn"],exec:["Đẩy hông ra sau — không phải gập gối","Hạ tạ theo ống chân đến khi lưng bắt đầu tròn","Siết mông kéo hông về để đứng thẳng"],breath:"Hít vào sâu, giữ hơi khi hạ. Thở ra khi đứng lên.",mistakes:[{w:"Lưng dưới tròn",f:"Siết lõi, neutral spine. Giảm ROM nếu cần"},{w:"Gập gối quá nhiều — thành squat",f:"Hip hinge thuần túy: đẩy hông ra sau là key"},{w:"Tạ đung đưa xa cơ thể",f:"Giữ tạ sát ống chân suốt chuyển động"}],cues:"Đẩy hông sau → tạ theo chân → stretch đùi sau → siết mông → đứng",alts:["Dumbbell RDL","Single-leg RDL","Good morning"],subs:["Leg curl","Nordic curl","Stiff-leg deadlift"]},
  {id:4,name:"Dumbbell Shoulder Press",vi:"Đẩy Vai Tạ Đôi",primary:"Anterior & Medial deltoid (vai trước, giữa)",secondary:"Triceps, Trapezius trên, Serratus anterior, Core",eq:"Tạ đôi + Ghế 90°",phase:"Strength / Hypertrophy",cat:"VAI",sets:"3–4",reps:"10–15",tempo:"2–0–2",rest:"60–90s",level:"Cơ bản – Trung bình",goal:"Phát triển vai tròn đều, tăng sức đẩy trên đầu",setup:["Ngồi thẳng, tựa sát vào tựa lưng 90°","Tạ ngang tai, khuỷu 90°, lòng bàn tay hướng về phía trước","Siết lõi, chân phẳng trên sàn"],exec:["Đẩy tạ lên thẳng đầu theo arc nhẹ — hai tạ hội tụ ở đỉnh","Không khóa khuỷu hoàn toàn — giữ tension","Hạ xuống kiểm soát 2 giây"],breath:"Thở ra khi đẩy lên. Hít vào khi hạ.",mistakes:[{w:"Ưỡn lưng quá mức",f:"Siết lõi, ép lưng sát ghế"},{w:"Khuỷu quá thấp gây impingement",f:"Khuỷu ngang vai hoặc hơi cao hơn"},{w:"Đẩy không cân 2 bên",f:"Nhìn gương, tập trung đồng đều"}],cues:"Siết lõi → khuỷu ngang vai → đẩy lên → hai tạ hội tụ → eccentric 2s",alts:["Machine shoulder press","Cable press","Pike push-up"],subs:["Arnold press","Barbell OHP","Landmine press"]},
  {id:5,name:"Dumbbell Bench Press",vi:"Đẩy Ngực Tạ Đôi",primary:"Pectoralis major (ngực lớn)",secondary:"Triceps brachii, Anterior deltoid, Serratus anterior",eq:"Tạ đôi + Flat bench",phase:"Strength / Hypertrophy",cat:"NGỰC",sets:"3–4",reps:"8–12",tempo:"2–1–2",rest:"60–90s",level:"Cơ bản – Trung bình",goal:"Phát triển ngực lớn toàn diện, cân bằng hơn barbell press",setup:["Nằm ngửa, chân phẳng trên sàn","Tạ ngang ngực, khuỷu 75°, lòng bàn tay hướng về phía chân","Siết lưng nhẹ vào ghế — arch tự nhiên"],exec:["Đẩy tạ lên và hội tụ nhẹ theo arc tự nhiên","Xiết ngực ở đỉnh — hai tạ không chạm nhau","Hạ xuống kiểm soát, tạ ngang đường núm vú"],breath:"Hít vào khi hạ. Thở ra khi đẩy lên.",mistakes:[{w:"Khuỷu 90° gây impingement",f:"Giữ khuỷu 60–75°"},{w:"Lưng nhấc khỏi ghế",f:"Chân đạp sàn, ép lưng giữa vào ghế"},{w:"Biên độ không đầy đủ",f:"Full ROM: hạ đến tạ ngang ngực"}],cues:"Lưng ép ghế → khuỷu 75° → hạ 2s → đẩy arc → xiết ngực đỉnh",alts:["Push-up","Machine chest press","Cable fly"],subs:["Barbell bench press","Incline dumbbell press","Dips"]},
  {id:6,name:"Cable Face Pull",vi:"Kéo Mặt Cáp",primary:"Posterior deltoid (vai sau)",secondary:"Trapezius giữa & dưới, Rhomboid, External rotators, Infraspinatus, Teres minor",eq:"Cable machine + Rope",phase:"Stabilization / Corrective",cat:"PHÒNG NGỪA",sets:"3–4",reps:"15–20",tempo:"2–2–2",rest:"45–60s",level:"Mọi cấp độ",goal:"Phòng ngừa chấn thương vai, cân bằng với bài đẩy, sửa tư thế tròn vai",setup:["Cáp ngang đầu, rope attachment","Cầm rope hai đầu, bước lùi tạo tension","Đứng thẳng, cổ trung lập"],exec:["Kéo rope về phía mặt, khuỷu ngang vai hoặc cao hơn","Xoay khuỷu ra ngoài — goalpost position","Giữ 2s xiết vai sau, trả về kiểm soát"],breath:"Thở ra khi kéo về. Hít vào khi trả về.",mistakes:[{w:"Kéo bằng biceps thay vì vai sau",f:"Tư duy 'khuỷu dẫn trước, bàn tay theo sau'"},{w:"Cúi đầu về phía trước",f:"Giữ đầu thẳng, cằm hơi vào trong"},{w:"Dùng momentum kéo nhanh",f:"Chậm và kiểm soát — bài corrective"}],cues:"Khuỷu dẫn → kéo về mặt → goalpost → xiết vai sau 2s → trả về",alts:["Band face pull","Dumbbell rear delt fly","Bent-over reverse fly"],subs:["External rotation band","YTW drill","Prone Y raise"]},
  {id:7,name:"Plank",vi:"Giữ Ván",primary:"Core (Transverse abdominis, Rectus abdominis)",secondary:"Erector spinae, Gluteus maximus, Shoulder stabilizers, Serratus anterior",eq:"Sàn / Mat",phase:"Stabilization Endurance",cat:"CORE",sets:"3–4",reps:"30–60s hold",tempo:"Isometric",rest:"30s",level:"Mọi cấp độ",goal:"Kích hoạt và tăng sức bền cơ lõi, ổn định cột sống",setup:["Chống khuỷu tay thẳng hàng dưới vai","Cơ thể thẳng từ đầu đến gót","Nhìn xuống sàn, cổ trung lập"],exec:["Siết bụng, siết mông, siết tứ đầu đồng thời","Đẩy khuỷu vào sàn như kéo sàn về phía mình","Thở đều và kiểm soát"],breath:"Thở đều 3–4 giây hít vào và thở ra. Không nín thở.",mistakes:[{w:"Mông nhô lên quá cao",f:"Hạ hông, cơ thể thẳng đầu đến gót"},{w:"Võng lưng, hông sụt",f:"Siết lõi và mông mạnh hơn"},{w:"Gánh bằng cổ và vai",f:"Siết toàn thân đồng đều"}],cues:"Siết bụng → siết mông → siết tứ đầu → thở đều → thẳng hàng",alts:["Plank trên gối","Wall plank","Incline plank"],subs:["RKC plank","Extended plank","Stability ball plank"]},
  {id:8,name:"Hip Thrust",vi:"Hip Thrust — Đẩy Hông",primary:"Gluteus maximus (mông lớn)",secondary:"Hamstrings, Core, Quadriceps, Erector spinae",eq:"Barbell + Flat bench",phase:"Strength / Hypertrophy",cat:"MÔNG",sets:"3–4",reps:"8–12",tempo:"2–0–2",rest:"60–90s",level:"Mọi cấp độ",goal:"Kích hoạt và phát triển mông tối đa",setup:["Vai tựa vào bench ngang vai gáy, tạ ngang hông có miếng đệm","Chân rộng bằng vai, mũi chân hơi xoay ngoài","Gối gập 90° khi ở đỉnh"],exec:["Đẩy hông lên bằng cách siết mông — không ưỡn lưng","Ở đỉnh: đùi song song sàn, siết mông 2 giây","Hạ hông xuống kiểm soát"],breath:"Thở ra khi đẩy hông lên. Hít vào khi hạ.",mistakes:[{w:"Ưỡn lưng thay vì siết mông",f:"Tucked chin, siết mông"},{w:"Gối đổ vào trong",f:"Đẩy gối ra ngoài chủ động"},{w:"Không xiết mông ở đỉnh",f:"Giữ 2 giây ở đỉnh — key point"}],cues:"Vai tựa bench → chân phẳng → siết mông → đẩy hông → giữ 2s → hạ",alts:["Glute bridge","Bodyweight hip thrust","Band hip thrust"],subs:["Romanian deadlift","Cable pull-through","Donkey kick"]},
  {id:9,name:"Pull-Up",vi:"Kéo Xà Đơn",primary:"Latissimus dorsi (lưng xô)",secondary:"Biceps brachii, Brachialis, Posterior deltoid, Teres major, Core",eq:"Xà đơn / Máy hỗ trợ",phase:"Strength / Hypertrophy",cat:"LƯNG",sets:"3–4",reps:"Max / AMRAP",tempo:"2–0–2",rest:"60–90s",level:"Trung bình – Nâng cao",goal:"Phát triển sức kéo và lưng xô tối đa",setup:["Tay rộng hơn vai, overhand grip","Treo thẳng hoàn toàn — full dead hang","Vai kéo xuống và ra sau trước khi kéo"],exec:["Kéo cơ thể lên cho đến khi cằm vượt xà","Xiết xô ở đỉnh, khuỷu kéo về phía hông","Hạ xuống full dead hang kiểm soát"],breath:"Hít vào khi ở dưới. Thở ra khi kéo lên.",mistakes:[{w:"Kipping — dùng đà swing",f:"Strict pull-up thuần kéo cơ"},{w:"Không xuống full dead hang",f:"Full ROM bắt buộc"},{w:"Cằm chạm xà nhưng xô không xiết",f:"Kéo khuỷu về hông, không phải đẩy cằm lên"}],cues:"Dead hang → vai xuống → khuỷu về hông → xiết xô → hạ kiểm soát",alts:["Assisted pull-up","Lat pulldown","Band pull-up"],subs:["Chin-up","Neutral grip pull-up","TRX row"]},
  {id:10,name:"Barbell Deadlift",vi:"Deadlift Tạ Đòn",primary:"Erector spinae, Gluteus maximus, Hamstrings",secondary:"Quadriceps, Core, Trapezius, Latissimus dorsi, Forearms",eq:"Tạ đòn Olympic + Sàn",phase:"Strength / Power",cat:"LƯNG / CHÂN",sets:"3–5",reps:"3–6",tempo:"3–0–1",rest:"120–180s",level:"Nâng cao",goal:"King of all exercises — tăng sức mạnh toàn thân tối đa",setup:["Chân rộng bằng hông, tạ sát ống chân 2–3cm","Gập hông cầm tạ — lưng phẳng, ngực ưỡn","Overhand hoặc mixed grip, vai trên tạ"],exec:["Đẩy sàn xuống với gót chân — hông và vai lên đồng thời","Tạ sát theo ống chân và đùi suốt hành trình","Ở đỉnh: đứng thẳng, siết mông — không hyperextend"],breath:"Hít sâu, Valsalva trước khi lift. Thở ra ở đỉnh.",mistakes:[{w:"Lưng tròn (rounding) khi kéo",f:"Ngực ưỡn, lưng phẳng — safety priority tuyệt đối"},{w:"Tạ đung đưa xa ống chân",f:"Giữ tạ sát cơ thể như 'cạo chân và đùi'"},{w:"Hông lên trước, vai sau",f:"Hông và vai lên đồng thời"}],cues:"Tạ sát ống chân → ngực ưỡn → đẩy sàn xuống → hông vai đồng thời → siết mông",alts:["Romanian deadlift","Trap bar deadlift","Good morning"],subs:["Sumo deadlift","Snatch-grip deadlift","Deficit deadlift"]},
  {id:11,name:"Dumbbell Lateral Raise",vi:"Nâng Tạ Ngang Vai",primary:"Medial deltoid (vai giữa)",secondary:"Anterior deltoid, Supraspinatus, Trapezius trên",eq:"Tạ đôi",phase:"Hypertrophy",cat:"VAI",sets:"3–4",reps:"12–20",tempo:"2–0–3",rest:"45–60s",level:"Mọi cấp độ",goal:"Phát triển vai giữa, tạo vai rộng và tròn",setup:["Đứng hoặc ngồi thẳng, tạ hai tay trước đùi","Khuỷu hơi co (soft elbow)","Tạ không chạm vào nhau"],exec:["Nâng tạ ngang vai theo arc rộng — giống rót nước từ ly","Ngón cái hơi thấp hơn ngón út ở đỉnh","Hạ xuống chậm 3 giây"],breath:"Thở ra khi nâng lên. Hít vào khi hạ.",mistakes:[{w:"Nhún vai — Trapezius thay vì vai giữa",f:"Hạ vai xuống trước khi nâng"},{w:"Nâng quá cao vượt ngang vai",f:"Dừng ở ngang vai"},{w:"Dùng momentum đung đưa người",f:"Tạ nhẹ hơn, kiểm soát cả 2 chiều"}],cues:"Vai xuống → arc rộng → đỉnh ngang vai → ngón cái hơi xuống → eccentric 3s",alts:["Cable lateral raise","Machine lateral raise","Band lateral raise"],subs:["Upright row","Arnold press","Face pull"]},
  {id:12,name:"Cable Tricep Pushdown",vi:"Đẩy Xuống Cáp Tam Đầu",primary:"Triceps brachii (cả 3 đầu)",secondary:"Anconeus, Forearm stabilizers",eq:"Cable machine + Straight bar hoặc Rope",phase:"Hypertrophy",cat:"TAY SAU",sets:"3–4",reps:"12–15",tempo:"2–0–2",rest:"45–60s",level:"Mọi cấp độ",goal:"Isolation tam đầu, phát triển đường cơ sau cánh tay",setup:["Cáp vị trí cao, đứng gần máy","Khuỷu sát hông, cẳng tay song song sàn","Vai và khuỷu cố định"],exec:["Đẩy tay xuống lockout hoàn toàn — xiết tam đầu mạnh","Khuỷu không di chuyển — cố định như bản lề","Trả lên chậm đến cẳng tay song song sàn"],breath:"Thở ra khi đẩy xuống. Hít vào khi trả lên.",mistakes:[{w:"Khuỷu đung đưa ra phía trước",f:"Ép khuỷu sát hông — pivot point cố định"},{w:"Không lockout ở đáy",f:"Full extension = xiết tam đầu tối đa"},{w:"Lean forward quá mức",f:"Nghiêng nhẹ 10° về phía trước là đủ"}],cues:"Khuỷu sát hông → đẩy full lockout → xiết tam đầu → trả lên kiểm soát",alts:["Band pushdown","Machine tricep press","Assisted dips"],subs:["Overhead tricep extension","Skull crusher","Close-grip bench press"]},
  {id:13,name:"Barbell Bicep Curl",vi:"Curl Tạ Đòn Tay Trước",primary:"Biceps brachii (tay trước)",secondary:"Brachialis, Brachioradialis",eq:"Tạ đòn hoặc EZ bar",phase:"Hypertrophy",cat:"TAY TRƯỚC",sets:"3–4",reps:"8–12",tempo:"2–0–2",rest:"45–60s",level:"Mọi cấp độ",goal:"Phát triển tay trước tối đa",setup:["Đứng thẳng, cầm tạ overhand dưới đùi","Tay rộng bằng vai, khuỷu sát hông","Chỉ cẳng tay di chuyển"],exec:["Curl tạ lên bằng cách co cơ tay trước","Siết biceps mạnh ở đỉnh","Hạ xuống full extension — không khoá khuỷu"],breath:"Thở ra khi curl lên. Hít vào khi hạ.",mistakes:[{w:"Khuỷu đung đưa ra phía trước",f:"Ép khuỷu sát hông, dùng tường kiểm tra"},{w:"Nhún người dùng momentum",f:"Tạ nhẹ hơn, đứng sát tường"},{w:"Không hạ full extension",f:"Full ROM = phát triển tối đa"}],cues:"Khuỷu sát hông → curl kiểm soát → xiết đỉnh → hạ full extension",alts:["Dumbbell curl","Band curl","Machine curl"],subs:["Hammer curl","Preacher curl","Incline dumbbell curl"]},
  {id:14,name:"Seated Cable Row",vi:"Kéo Cáp Ngồi",primary:"Latissimus dorsi, Rhomboid, Trapezius giữa",secondary:"Biceps brachii, Posterior deltoid, Erector spinae",eq:"Cable machine + V-bar",phase:"Strength / Hypertrophy",cat:"LƯNG",sets:"3–4",reps:"10–15",tempo:"2–1–2",rest:"60–90s",level:"Cơ bản – Trung bình",goal:"Phát triển độ dày lưng giữa, cải thiện tư thế",setup:["Ngồi thẳng, chân hơi co trên footrest","Cầm tay kéo, lưng thẳng","Vai hơi kéo ra sau, ngực ưỡn nhẹ"],exec:["Kéo tay về phía rốn, khuỷu sát hông","Xiết lưng giữa và xô ở cuối — vai kéo về sau xuống","Trả tay về chậm, cảm nhận stretch lưng"],breath:"Thở ra khi kéo về. Hít vào khi trả về.",mistakes:[{w:"Nghiêng thân quá mức",f:"Giữ lưng thẳng 90° — chuyển động chỉ ở tay"},{w:"Dùng đà body swing",f:"Kiểm soát hoàn toàn"},{w:"Vai nhô lên khi trả",f:"Kiểm soát eccentric, cảm nhận kéo căng xô"}],cues:"Lưng thẳng → kéo về rốn → khuỷu sát hông → xiết lưng giữa → trả kiểm soát",alts:["Dumbbell row","Band row","TRX row"],subs:["Barbell row","T-bar row","Machine row"]},
  {id:15,name:"Incline Dumbbell Press",vi:"Đẩy Ngực Nghiêng Lên",primary:"Pectoralis major phần trên (ngực trên)",secondary:"Anterior deltoid, Triceps, Serratus anterior",eq:"Tạ đôi + Ghế nghiêng 30–45°",phase:"Strength / Hypertrophy",cat:"NGỰC",sets:"3–4",reps:"8–12",tempo:"2–1–2",rest:"60–90s",level:"Cơ bản – Trung bình",goal:"Phát triển ngực trên, tạo đường cơ ngực đầy đặn",setup:["Ghế nghiêng 30–45°","Tạ ngang ngực trên, khuỷu 75°","Siết lưng vào ghế, chân phẳng trên sàn"],exec:["Đẩy tạ lên và hội tụ nhẹ — arc tự nhiên","Không khóa khuỷu ở đỉnh","Hạ xuống kiểm soát 2 giây"],breath:"Thở ra khi đẩy. Hít vào khi hạ.",mistakes:[{w:"Góc ghế quá dốc 60–90°",f:"Tối đa 45° để focus ngực trên"},{w:"Khuỷu quá rộng",f:"Tuck khuỷu nhẹ 60–75°"},{w:"Bounce tạ dưới đáy",f:"Kiểm soát eccentric hoàn toàn"}],cues:"Ghế 30–45° → khuỷu 75° → hạ 2s → đẩy arc → xiết ngực trên",alts:["Incline push-up","Cable incline fly","Smith incline"],subs:["Barbell incline press","Decline press","Cable fly"]},
];

const CATS = ["TẤT CẢ","LƯNG","NGỰC","VAI","CHÂN","TAY TRƯỚC","TAY SAU","CORE","MÔNG","CHÂN / LƯNG","LƯNG / CHÂN","PHÒNG NGỪA"];

// ─── NASM Curriculum ────────────────────────────────────────────────────────
const NASM_CURRICULUM = [
  {
    id:1, icon:"🧬", title:"Khoa học nền tảng", subtitle:"Basic & Applied Sciences",
    color:"#C8102E",
    chapters:[
      {title:"Giải phẫu học Thần kinh – Cơ – Xương (Kinesiology)",content:`**Hệ thần kinh cơ (Neuromuscular system)**\nCách hệ thần kinh giao tiếp với cơ bắp để điều khiển chuyển động. Mỗi sợi cơ được kiểm soát bởi một motor neuron thông qua tín hiệu điện hoá học.\n\n**Các loại cơ:**\n• Cơ vân (Skeletal) — chủ động, kiểm soát tự nguyện\n• Cơ trơn (Smooth) — nội tạng, tự động\n• Cơ tim (Cardiac) — tim, tự động\n\n**Cơ chế co cơ (Sliding Filament Theory):**\nActin + Myosin → Cross-bridge formation → ATP cung cấp năng lượng → Cơ co lại\n\n**Phân loại sợi cơ:**\n• Type I (Slow-twitch) — sức bền, chống mỏi tốt, ít lực\n• Type IIa (Fast-twitch oxidative) — sức mạnh + sức bền\n• Type IIb/x (Fast-twitch glycolytic) — lực tối đa, mỏi nhanh\n\n**Các khớp chính và ROM:**\nKhớp vai (Glenohumeral) — linh hoạt nhất, dễ tổn thương nhất. Khớp hông (Hip) — ball-and-socket, ổn định hơn. Khớp gối (Knee) — hinge joint, chỉ gập duỗi.`},
      {title:"Cơ sinh học (Biomechanics)",content:`**3 mặt phẳng chuyển động:**\n• Sagittal Plane — cử động trước/sau (squat, deadlift, curl)\n• Frontal Plane — cử động ngang (lateral raise, side lunge)\n• Transverse Plane — cử động xoay (rotation, cable woodchop)\n\n**Các loại co cơ:**\n• Concentric — cơ ngắn lại (lifting phase)\n• Eccentric — cơ dài ra dưới tải (lowering phase — quan trọng nhất cho hypertrophy)\n• Isometric — cơ co nhưng không thay đổi độ dài (plank, wall sit)\n\n**Đòn bẩy cơ thể:**\nFirst-class, Second-class, Third-class lever. Hầu hết cơ thể dùng Third-class (kém cơ học nhưng biên độ chuyển động lớn).\n\n**Lực và momen lực:**\nTorque = Force × Moment Arm. Hiểu tại sao góc khuỷu tay ảnh hưởng đến lực tác động lên cơ.`},
      {title:"Hệ thống năng lượng (Energy Systems)",content:`**3 hệ thống ATP:**\n\n**① ATP-PC System (Phosphocreatine)**\n• Thời gian: 0–10 giây\n• Hoạt động: Sprint tối đa, 1RM lift, jump\n• Phục hồi: 3–5 phút nghỉ\n\n**② Glycolytic System (Anaerobic)**\n• Thời gian: 10 giây – 2 phút\n• Hoạt động: Sets 8–15 reps, HIIT\n• Sản phẩm phụ: Lactate (không phải "axit lactic")\n\n**③ Oxidative System (Aerobic)**\n• Thời gian: 2+ phút\n• Hoạt động: Cardio, tập bền\n• Hiệu quả cao nhất, sử dụng mỡ và carb\n\n**Ứng dụng thực tế:**\nPhase 1 NASM: Cardio zone 2 (60–70% max HR) → Oxidative\nPhase 4: Heavy compound lifts → ATP-PC\nPhase 3: Moderate weight, 8–12 reps → Glycolytic`},
      {title:"Sinh lý học Tim mạch & Hô hấp",content:`**Phản ứng cấp tính (Acute responses) khi tập:**\n• Tăng nhịp tim (HR), tăng lưu lượng tim (Cardiac output)\n• Tăng huyết áp (đặc biệt systolic)\n• Tăng lưu lượng máu đến cơ hoạt động\n• Tăng tần số thở (Respiratory rate)\n\n**Thích nghi dài hạn (Chronic adaptations):**\n• Tim to ra (Cardiac hypertrophy) — có lợi\n• Tăng thể tích nhát bóp (Stroke volume)\n• Giảm nhịp tim nghỉ (Resting HR giảm)\n• Tăng mật độ mao mạch trong cơ\n• Tăng VO2max\n\n**Công thức tính Max HR:**\n220 – Tuổi = Max HR (ước tính)\n\n**Zone tập luyện:**\n• Zone 1 (50–60%): Phục hồi\n• Zone 2 (60–70%): Fat burning, aerobic base\n• Zone 3 (70–80%): Aerobic endurance\n• Zone 4 (80–90%): Threshold training\n• Zone 5 (90–100%): VO2max, anaerobic`},
    ]
  },
  {
    id:2, icon:"📊", title:"Đánh giá thể trạng & tư thế", subtitle:"Fitness Assessments",
    color:"#1D4ED8",
    chapters:[
      {title:"Đánh giá Y tế & Lối sống",content:`**PAR-Q (Physical Activity Readiness Questionnaire):**\n7 câu hỏi sàng lọc trước khi tập. Nếu trả lời CÓ bất kỳ câu nào → cần xin phép bác sĩ trước.\n\n**Thông tin cần thu thập:**\n• Tiền sử bệnh lý (tim mạch, tiểu đường, cao huyết áp)\n• Chấn thương và phẫu thuật cũ\n• Thuốc đang dùng (ảnh hưởng đến nhịp tim, huyết áp)\n• Mục tiêu tập luyện và timeline\n• Lịch sử tập luyện\n• Lối sống: công việc, giấc ngủ, stress, dinh dưỡng\n\n**Đo lường sinh lý học cơ bản:**\n• Huyết áp nghỉ: Bình thường < 120/80 mmHg\n• Nhịp tim nghỉ: Bình thường 60–100 bpm\n• BMI và vòng eo (không đủ để đánh giá sức khỏe toàn diện)\n• Thành phần cơ thể: Body fat % (skinfold, DEXA, bioelectrical)`},
      {title:"Đánh giá tư thế tĩnh (Static Posture)",content:`**Nhìn từ phía trước:**\n✓ Đầu thẳng, không nghiêng\n✓ Vai ngang bằng\n✓ Hông ngang bằng\n✓ Gối thẳng hướng về phía trước\n\n**Nhìn từ phía bên:**\n✓ Tai trên vai trên hông trên gối trên mắt cá chân\n✓ Cột sống có 3 đường cong tự nhiên\n\n**Hội chứng chéo trên (Upper Crossed Syndrome):**\nCơ căng: Pec major/minor, Upper trap, Levator scapulae\nCơ yếu: Deep neck flexors, Lower/mid trap, Serratus anterior\nBiểu hiện: Đầu chìa ra trước (Forward head), vai tròn\n\n**Hội chứng chéo dưới (Lower Crossed Syndrome):**\nCơ căng: Hip flexors (Psoas), Erector spinae\nCơ yếu: Gluteus maximus, Core (Transverse abdominis)\nBiểu hiện: Ưỡn lưng quá mức (Lordosis), bụng phình`},
      {title:"Overhead Squat Assessment (OHSA)",content:`**Cách thực hiện:**\nKhách đứng chân rộng bằng vai, tay giơ thẳng lên đầu, thực hiện squat 5 reps. Quan sát từ 3 phía.\n\n**Lỗi phổ biến và ý nghĩa:**\n\n📌 **Gối đổ vào trong (Valgus):**\nOveractive: Adductors, TFL, Lateral gastrocnemius\nUnderactive: Glute med/max, Vastus medialis, Anterior tibialis\n\n📌 **Chân quay ra ngoài quá mức:**\nOveractive: Soleus, Lateral gastrocnemius, Short head biceps femoris\nUnderactive: Medial gastrocnemius, Medial hamstrings\n\n📌 **Gót chân nhấc lên:**\nOveractive: Soleus, Gastrocnemius, Peroneals\nUnderactive: Anterior tibialis\n\n📌 **Thân người đổ về phía trước:**\nOveractive: Soleus, Hip flexors (Psoas), Abdominal complex\nUnderactive: Anterior tibialis, Glute max, Erector spinae\n\n📌 **Lưng dưới tròn:**\nOveractive: Hip flexors, Obliques\nUnderactive: Erector spinae, Glute max`},
      {title:"Đánh giá Hiệu suất",content:`**Cardiorespiratory Assessment:**\n• Rockport Walk Test (1 mile)\n• 3-Minute Step Test\n• 1.5-Mile Run Test\n• VO2max estimate từ HR sau test\n\n**Sức mạnh và sức bền:**\n• Push-up Test: đếm max reps đúng form\n• Squat Test: max reps trong 60 giây\n• Plank Hold: thời gian giữ tối đa\n• Davies Test: vai stability\n\n**Sức mạnh tối đa (1RM estimation):**\nCông thức Epley: 1RM = w × (1 + reps/30)\nVD: Bench 80kg × 8 reps → 1RM = 80 × (1 + 8/30) ≈ 101kg\n\n**Sức bền Tim mạch:**\nVO2max tốt: Nam >50, Nữ >45 mL/kg/min\nVO2max trung bình: Nam 40–50, Nữ 35–45`},
    ]
  },
  {
    id:3, icon:"⚡", title:"Mô hình OPT", subtitle:"Optimum Performance Training",
    color:"#059669",
    chapters:[
      {title:"Phase 1 — Stabilization Endurance",content:`**Mục tiêu:**\nSửa chữa mất cân bằng cơ bắp, cải thiện ổn định khớp, tăng core strength, chuẩn bị gân cốt cho tải nặng hơn.\n\n**Đối tượng:** Người mới bắt đầu, sau chấn thương, sau thời gian dài không tập\n\n**Thông số tập luyện:**\n• Sets: 1–3\n• Reps: 12–20\n• Intensity: 50–70% 1RM\n• Tempo: 4–2–2 (eccentric chậm)\n• Rest: 0–90 giây\n• Thời gian mỗi phase: 4–6 tuần\n\n**Loại bài tập ưu tiên:**\n• Bodyweight và tạ nhẹ\n• Unstable surface (BOSU, balance board)\n• Unilateral exercises (1 chân, 1 tay)\n• Core activation exercises\n\n**Ví dụ bài tập:**\nSquat → Single-leg squat\nDumbbell curl → Standing 1-arm curl\nPlank, Dead bug, Bird dog\nTRX row, Stability ball exercises`},
      {title:"Phase 2 — Strength Endurance",content:`**Mục tiêu:**\nTăng cường khối lượng công việc, duy trì sự ổn định, phát triển sức mạnh + sức bền đồng thời.\n\n**Phương pháp đặc trưng: SUPERSET**\n1 bài tập sức mạnh truyền thống + 1 bài tập ổn định cùng nhóm cơ\n(Nghỉ tối thiểu giữa 2 bài, nghỉ bình thường sau superset)\n\n**Ví dụ superset:**\n• Barbell Bench Press + Stability Ball Push-up\n• Barbell Back Squat + Single-leg Squat\n• Seated Row + Band Row trên 1 chân\n\n**Thông số:**\n• Sets: 2–4\n• Reps: 8–12 (bài sức mạnh), 12–20 (bài ổn định)\n• Intensity: 70–80% 1RM\n• Tempo: 2–0–2\n• Rest: 0s giữa superset, 60s sau superset\n\n**Thời gian:** 4–6 tuần`},
      {title:"Phase 3 — Muscular Hypertrophy",content:`**Mục tiêu:**\nTối đa hóa sự phát triển kích thước cơ bắp (Muscle mass).\n\n**Cơ chế hypertrophy:**\n• Mechanical tension (Căng cơ học) — tải nặng\n• Metabolic stress (Căng thẳng trao đổi chất) — pump, bơm máu\n• Muscle damage (Tổn thương cơ) — DOMS, eccentric\n\n**Thông số:**\n• Sets: 3–5\n• Reps: 6–12\n• Intensity: 75–85% 1RM\n• Tempo: 2–0–2 đến 4–0–1\n• Rest: 60–90 giây\n• Volume cao: 10–20 sets/nhóm cơ/tuần\n\n**Nguyên tắc quan trọng:**\n• Progressive overload mỗi tuần\n• Đa dạng góc độ tập\n• Ưu tiên compound trước isolation\n• Đảm bảo protein 1.6–2.2g/kg cân nặng\n\n**Thời gian:** 4–8 tuần`},
      {title:"Phase 4 — Maximal Strength",content:`**Mục tiêu:**\nTăng khả năng huy động motor units tối đa, tăng 1RM.\n\n**Thông số:**\n• Sets: 4–6\n• Reps: 1–5\n• Intensity: 85–100% 1RM\n• Tempo: Controlled eccentric, explosive concentric\n• Rest: 3–5 phút (quan trọng — ATP-PC recovery)\n\n**Bài tập trọng tâm:**\nBig 5: Squat, Deadlift, Bench Press, OHP, Barbell Row\n\n**Lưu ý an toàn:**\n• Bắt buộc warm-up và activation đầy đủ\n• Cần spotter cho bench và squat\n• Không tập strength phase khi bị chấn thương, thiếu ngủ\n• Deload mỗi 4–6 tuần\n\n**Chỉ dành cho:**\nKhách có ít nhất 6 tháng kinh nghiệm tập luyện liên tục, form chuẩn.\n\n**Thời gian:** 4–6 tuần`},
      {title:"Phase 5 — Power",content:`**Mục tiêu:**\nTăng tốc độ co cơ. Power = Force × Velocity\n\n**Phương pháp: SUPERSET**\nBài sức mạnh nặng (80–85% 1RM, 1–5 reps)\n+ Bài bùng nổ nhanh (30–45% 1RM, di chuyển tối đa tốc độ)\n\n**Ví dụ superset power:**\n• Heavy Barbell Squat (4×3) + Jump Squat (4×10)\n• Heavy Deadlift (4×2) + Box Jump (4×5)\n• Heavy Bench (4×3) + Explosive Push-up (4×8)\n\n**Thông số:**\n• Sets: 3–5\n• Reps sức mạnh: 1–5\n• Reps bùng nổ: 8–10\n• Rest: 3–5 phút\n\n**Đối tượng:** Vận động viên, người tập nâng cao\n\n**Thời gian:** 4–6 tuần`},
    ]
  },
  {
    id:4, icon:"🏋️", title:"Kỹ thuật tập luyện", subtitle:"Exercise Technique",
    color:"#7C3AED",
    chapters:[
      {title:"Tập luyện linh hoạt (Flexibility Training)",content:`**SMR — Self-Myofascial Release (Foam Rolling):**\nTác dụng: Giải phóng điểm trigger, tăng ROM, giảm đau cơ sau tập\nCách thực hiện: Lăn chậm, dừng 30–60 giây tại điểm đau, thở đều\nKhi nào dùng: Trước và sau tập\n\n**Static Stretching (Giãn cơ tĩnh):**\nGiữ tư thế 30–60 giây\nTốt nhất sau tập khi cơ đã ấm\nGiảm hiệu suất nếu dùng trước tập sức mạnh\n\n**Active Stretching (Giãn cơ chủ động):**\nCo cơ đối lập để kéo giãn cơ mục tiêu (không dùng tay).\nAn toàn hơn, tốt trước tập\n\n**Dynamic Stretching (Giãn cơ động):**\nLeg swing, Hip circle, Arm circle — warm-up lý tưởng trước tập\nTăng nhiệt độ cơ và ROM mà không giảm sức mạnh\n\n**Thứ tự warm-up lý tưởng NASM:**\n① SMR foam rolling → ② Static/Active stretch (cơ tight) → ③ Dynamic warm-up → ④ Tập chính`},
      {title:"Tập luyện Core",content:`**Core trong NASM không chỉ là bụng:**\nCore = Toàn bộ hệ cơ từ pelvis đến shoulder girdle (cả trước, sau, hai bên)\n\n**Hệ thống cơ lõi sâu (Local stabilizers):**\n• Transverse abdominis (TA) — co trước mọi chuyển động chi\n• Multifidus — ổn định từng đốt sống\n• Pelvic floor, Diaphragm\n\n**Hệ thống cơ lõi bề mặt (Global movers):**\n• Rectus abdominis, External/Internal obliques\n• Erector spinae, Gluteus maximus\n\n**Nguyên tắc tập core NASM:**\n① Kích hoạt local trước (TA activation - "draw-in")\n② Progressively load từ dễ đến khó\n③ Anti-movement trước movement (Plank trước Crunch)\n\n**Bài tập theo tiến độ:**\nLevel 1: Dead bug, Bird dog, Plank\nLevel 2: Pallof press, Ab wheel (ngắn), Side plank\nLevel 3: Dragon flag, Ab wheel (dài), Hanging leg raise`},
      {title:"Tập luyện thăng bằng (Balance Training)",content:`**Proprioception (Cảm nhận bản thể):**\nKhả năng cơ thể nhận biết vị trí của mình trong không gian\nTrung tâm: Mechanoreceptors trong khớp và cơ → → Cerebellum\n\n**Tại sao quan trọng:**\n• Giảm nguy cơ chấn thương\n• Cải thiện hiệu suất thể thao\n• Phục hồi sau chấn thương (đặc biệt mắt cá chân)\n\n**Tiến độ tập balance NASM:**\n① 2 chân trên mặt phẳng ổn định\n② 1 chân trên mặt phẳng ổn định\n③ 2 chân trên mặt phẳng không ổn định (BOSU)\n④ 1 chân trên mặt phẳng không ổn định\n\n**Ví dụ bài tập:**\nSingle-leg balance → Single-leg reach → Single-leg RDL\nTandem stance → BOSU squat → Single-leg BOSU squat`},
      {title:"Plyometric & SAQ Training",content:`**Plyometric (Phản xạ bùng nổ):**\nStretch-Shortening Cycle (SSC) — cơ duỗi nhanh rồi co lại\nTạo ra lực tối đa trong thời gian ngắn nhất\n\n**Tiến độ NASM:**\n• Stabilization: Squat jump (landing focus), Box squat jump\n• Strength: Tuck jump, Broad jump, Lateral bound\n• Power: Depth jump, Reactive jump, Single-leg hop\n\n**Coaching cues plyometric:**\n"Nhẹ như mèo khi tiếp đất"\n"Hấp thụ lực khi hạ — không dập gối"\n"Giữ tư thế athletic trước mỗi rep"\n\n**SAQ — Speed, Agility, Quickness:**\n• Speed: Tốc độ đường thẳng (sprint drills)\n• Agility: Thay đổi hướng (cone drills, ladder)\n• Quickness: Phản xạ và thời gian phản ứng\n\n**Ứng dụng:** Vận động viên, tập thể thao chức năng`},
      {title:"Tập kháng lực (Resistance Training)",content:`**Nguyên tắc thiết kế bài tập:**\n\n📌 **SAID Principle:** Specific Adaptation to Imposed Demands\nCơ thể thích nghi với chính xác loại kích thích được áp dụng.\nTập nặng → mạnh. Tập nhẹ nhiều reps → bền. Tập bùng nổ → power.\n\n📌 **Progressive Overload:**\nTăng tải liên tục theo thời gian: tăng tạ, tăng reps, giảm nghỉ, tăng tempo\n\n📌 **Volume & Intensity:**\nVolume = Sets × Reps × Weight\nIntensity tỷ lệ nghịch với Volume\n\n**Thứ tự bài tập tối ưu:**\n① Compound (đa khớp) trước Isolation\n② Nhóm cơ lớn trước nhóm cơ nhỏ\n③ Bài khó (power/strength) trước bài dễ\n\n**Tần suất và phục hồi:**\nMỗi nhóm cơ cần 48–72h phục hồi\nTập 2–3x/tuần cho beginners\nAdvanced: Upper/Lower split hoặc Push/Pull/Legs`},
    ]
  },
  {
    id:5, icon:"🥦", title:"Dinh dưỡng thể thao", subtitle:"Sports Nutrition",
    color:"#0891B2",
    chapters:[
      {title:"Đa lượng chất (Macronutrients)",content:`**Protein:**\n• 1g = 4 kcal\n• Chức năng: Xây dựng và sửa chữa cơ bắp, enzyme, hormone\n• Nhu cầu: 1.6–2.2g/kg/ngày (tập sức mạnh)\n• Nguồn tốt: Thịt gà, cá, trứng, đậu phụ, whey protein\n• Không dùng hết một lúc — chia 4–5 bữa 30–40g\n\n**Carbohydrate:**\n• 1g = 4 kcal\n• Nhiên liệu chính cho tập cường độ cao\n• Nhu cầu: 3–7g/kg/ngày (tuỳ cường độ)\n• Glycogen dự trữ trong cơ và gan\n• Timing: Trước tập (complex carbs), sau tập (simple carbs)\n\n**Fat (Chất béo):**\n• 1g = 9 kcal\n• Chức năng: Hormone (đặc biệt testosterone), hấp thụ vitamin, não\n• Nhu cầu: 20–35% tổng calories\n• Không cắt fat dưới 15% — nguy hiểm cho hormone\n• Nguồn tốt: Bơ, cá béo (Omega-3), dầu olive, hạt`},
      {title:"Năng lượng & Cân bằng Calories",content:`**BMR (Basal Metabolic Rate):**\nNăng lượng tiêu thụ khi nghỉ ngơi hoàn toàn\n\nCông thức Mifflin-St Jeor:\n• Nam: 10×W + 6.25×H – 5×A + 5\n• Nữ: 10×W + 6.25×H – 5×A – 161\n(W=cân nặng kg, H=chiều cao cm, A=tuổi)\n\n**TDEE = BMR × Activity Factor:**\n• Ít vận động: ×1.2\n• Nhẹ (1–3 ngày/tuần): ×1.375\n• Vừa (3–5 ngày): ×1.55\n• Nhiều (6–7 ngày): ×1.725\n• Rất nhiều (2 lần/ngày): ×1.9\n\n**Mục tiêu:**\n• Giảm mỡ: TDEE – 300 đến –500 kcal/ngày\n• Tăng cơ: TDEE + 200 đến +400 kcal/ngày\n• Duy trì: = TDEE\n\n**Tốc độ an toàn:**\nGiảm mỡ: 0.5–1kg/tuần\nTăng cơ sạch: 0.25–0.5kg/tuần`},
      {title:"Timing dinh dưỡng & Supplements",content:`**Pre-workout (1–2 giờ trước tập):**\n• Complex carbs + protein\n• Ví dụ: Cơm + ức gà, bánh mì + trứng, oatmeal + protein shake\n• Tránh chất béo và chất xơ cao (chậm tiêu)\n\n**Intra-workout (trong khi tập >60 phút):**\n• Nước + điện giải\n• BCAA hoặc EAA (optional)\n• 30–60g carbs/giờ nếu tập dài\n\n**Post-workout (trong 30–60 phút sau tập):**\n• Protein 30–40g (whey hấp thụ nhanh)\n• Simple carbs 40–60g (replenish glycogen)\n• Ví dụ: Whey shake + chuối, cơm trắng + thịt\n\n**Supplements bằng chứng khoa học mạnh (Grade A):**\n✅ Creatine Monohydrate: 5g/ngày — tăng sức mạnh, phục hồi\n✅ Caffeine: 3–6mg/kg trước tập — tăng hiệu suất\n✅ Whey Protein: Bổ sung protein tiện lợi\n✅ Vitamin D + Omega-3: Sức khoẻ tổng thể\n\n**Supplements KHÔNG hiệu quả (bằng chứng yếu):**\n❌ BCAA khi đã đủ protein\n❌ Most "fat burners"\n❌ Testosterone boosters thực vật`},
      {title:"Hydration & Vi lượng chất",content:`**Nước — quan trọng nhất:**\n• Mất 2% body water → giảm 20% hiệu suất\n• Nhu cầu cơ bản: 35–45ml/kg/ngày\n• Tăng thêm khi tập: 500–1000ml/giờ tập\n• Kiểm tra: Nước tiểu màu vàng nhạt = đủ nước\n\n**Điện giải (Electrolytes):**\n• Sodium — điều chỉnh nước trong/ngoài tế bào\n• Potassium — co cơ và nhịp tim\n• Magnesium — tổng hợp protein, phục hồi cơ\n• Calcium — co cơ và xương\n\n**Vitamin quan trọng cho PT:**\n• Vitamin D: 70% người Việt thiếu — ảnh hưởng cơ và hormone\n• Vitamin C: Collagen, phục hồi mô\n• B-complex: Chuyển hóa năng lượng\n• Zinc: Testosterone, immune system\n\n**Chỉ đo lường không đủ — hỏi thêm:**\n• Chất lượng giấc ngủ (7–9 tiếng)\n• Mức độ stress\n• Nguyên nhân không phục hồi được`},
    ]
  },
  {
    id:6, icon:"🧠", title:"Tâm lý & Quản lý khách", subtitle:"Behavioral Coaching",
    color:"#D97706",
    chapters:[
      {title:"Giao tiếp & Kỹ năng lắng nghe",content:`**Active Listening — Lắng nghe chủ động:**\n• Dừng nói và thực sự chú ý\n• Không ngắt lời khi khách đang nói\n• Phản chiếu lại (Reflecting): "Nghe có vẻ bạn đang cảm thấy..."\n• Đặt câu hỏi mở: "Điều gì khiến bạn quyết định bắt đầu tập?"\n• Không phán xét — tạo không gian an toàn\n\n**Câu hỏi mạnh (Powerful questions):**\n• "Mục tiêu này có ý nghĩa gì với bạn?"\n• "Điều gì sẽ thay đổi nếu bạn đạt được điều này?"\n• "Điều gì đã ngăn bạn trước đây?"\n• "Bạn cần gì từ tôi để thành công?"\n\n**Tránh:**\n• Nói "bạn phải" — nói "một lựa chọn có thể là..."\n• Đưa ra quá nhiều thông tin một lúc\n• Giải quyết vấn đề trước khi hiểu cảm xúc\n• So sánh khách hàng với nhau`},
      {title:"Thiết lập mục tiêu SMART",content:`**S — Specific (Cụ thể):**\nKhông tốt: "Tôi muốn giảm cân"\nTốt: "Tôi muốn giảm 5kg mỡ cơ thể"\n\n**M — Measurable (Đo lường được):**\nKhông tốt: "Tôi muốn cơ thể đẹp hơn"\nTốt: "Giảm body fat từ 25% xuống 20%"\n\n**A — Achievable (Khả thi):**\nThực tế với thời gian, nguồn lực, điểm xuất phát\nGiảm 5kg trong 2 tháng: khả thi\nGiảm 15kg trong 1 tháng: không khả thi, nguy hiểm\n\n**R — Relevant (Có ý nghĩa):**\nMục tiêu phải quan trọng với khách, không phải với PT\nHỏi: "Tại sao điều này quan trọng với bạn?"\n\n**T — Time-bound (Có thời hạn):**\nDeadline tạo động lực\nPhân chia: Mục tiêu dài hạn (6 tháng) → trung hạn (1 tháng) → hàng tuần\n\n**Check-in định kỳ:**\nReview mục tiêu mỗi 2–4 tuần\nĐiều chỉnh nếu cần — không phải thất bại, là thích nghi`},
      {title:"Mô hình thay đổi hành vi",content:`**Transtheoretical Model (Stages of Change):**\n\n**① Precontemplation (Chưa nhận thức):**\nKhách không thấy cần thay đổi\nPT: Giáo dục nhẹ nhàng, không ép buộc\n\n**② Contemplation (Đang cân nhắc):**\nBiết cần thay đổi nhưng chưa quyết tâm\nPT: Khám phá lý do, tăng động lực nội tại\n\n**③ Preparation (Chuẩn bị):**\nSắp sẵn sàng — lên kế hoạch\nPT: Hỗ trợ lên kế hoạch cụ thể\n\n**④ Action (Hành động):**\nĐang thực hiện thay đổi\nPT: Hỗ trợ tích cực, tracking, giải quyết rào cản\n\n**⑤ Maintenance (Duy trì):**\nDuy trì thay đổi >6 tháng\nPT: Ngăn relapse, thêm thách thức mới\n\n**Self-Determination Theory:**\n• Autonomy — cảm giác được tự chọn\n• Competence — cảm giác có năng lực\n• Relatedness — cảm giác kết nối\nKhi cả 3 được thoả mãn → động lực nội tại mạnh nhất`},
      {title:"Quản lý kinh doanh PT",content:`**Xây dựng thương hiệu cá nhân:**\n• Chuyên môn hoá: Chọn 1–2 niche (giảm mỡ sau sinh, vận động viên, senior fitness)\n• Consistency: Ảnh đại diện, màu sắc, giọng văn nhất quán\n• Social proof: Kết quả khách hàng thực tế\n• Content marketing: Chia sẻ kiến thức miễn phí → tạo trust\n\n**Giữ chân khách hàng:**\n• Onboarding tốt (2–4 buổi đầu) quyết định 80% retention\n• Tracking tiến độ thường xuyên và trực quan\n• Celebrate small wins\n• Nhắc nhở proactively khi vắng tập\n\n**Xử lý phản đối giá:**\n• Đừng giảm giá — giải thích value\n• So sánh với chi phí y tế khi không tập\n• Offer payment plans\n• Trial session\n\n**Đạo đức nghề nghiệp PT:**\n• Luôn hoạt động trong phạm vi chứng chỉ\n• Không chuẩn đoán bệnh\n• Giữ bí mật thông tin khách hàng\n• Tiếp tục học tập và cập nhật kiến thức`},
    ]
  },
];

// ─── Components ─────────────────────────────────────────────────────────────
const Divider = () => <div style={{height:1,background:T.border,margin:"24px 0"}} />;

const PageHeader = ({ label, title, subtitle }) => (
  <div style={{marginBottom:32}}>
    <div style={{fontSize:11,fontFamily:"DM Sans",color:T.red,letterSpacing:3,textTransform:"uppercase",marginBottom:6,fontWeight:600}}>{label}</div>
    <div style={{fontSize:40,fontFamily:"Oswald",color:T.black,fontWeight:700,lineHeight:1,letterSpacing:1}}>{title}</div>
    {subtitle && <div style={{fontSize:14,color:T.grey,marginTop:6,fontFamily:"DM Sans"}}>{subtitle}</div>}
  </div>
);

const Chip = ({ children, color=T.red, bg, border }) => (
  <span style={{display:"inline-block",background:bg||`${color}12`,border:`1px solid ${border||color+"30"}`,color,fontSize:10,fontWeight:700,padding:"3px 9px",borderRadius:4,fontFamily:"DM Sans",letterSpacing:0.5,whiteSpace:"nowrap"}}>{children}</span>
);

// ─── Exercise Card ──────────────────────────────────────────────────────────
const ExCard = ({ ex, onClick }) => {
  const [hover, setHover] = useState(false);
  return (
    <div onClick={() => onClick(ex)} onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{background:T.bg,border:`1px solid ${hover?"#AAAAAA":T.border}`,borderRadius:12,overflow:"hidden",cursor:"pointer",transition:"all 0.18s",boxShadow:hover?"0 8px 32px rgba(0,0,0,0.10)":"0 1px 4px rgba(0,0,0,0.04)"}}>
      <div style={{borderLeft:`4px solid ${T.red}`,padding:"16px 18px",background:T.bgOff}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8}}>
          <Chip>{ex.cat}</Chip>
          <Chip color={T.grey} bg="transparent" border={T.border}>{ex.phase}</Chip>
        </div>
        <div style={{fontSize:20,fontFamily:"Oswald",color:T.black,fontWeight:600,letterSpacing:0.5,lineHeight:1.1}}>{ex.name}</div>
        <div style={{fontSize:12,color:T.grey,fontFamily:"DM Sans",marginTop:2}}>{ex.vi}</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",borderBottom:`1px solid ${T.border}`}}>
        {[["SETS",ex.sets],["REPS",ex.reps],["TEMPO",ex.tempo],["NGHỈ",ex.rest]].map(([l,v],i)=>(
          <div key={i} style={{padding:"10px 12px",borderRight:i<3?`1px solid ${T.border}`:"none"}}>
            <div style={{fontSize:9,color:T.lightGrey,fontFamily:"DM Sans",letterSpacing:1,textTransform:"uppercase"}}>{l}</div>
            <div style={{fontSize:14,fontFamily:"Oswald",color:T.black,fontWeight:500,marginTop:2}}>{v}</div>
          </div>
        ))}
      </div>
      <div style={{padding:"12px 18px"}}>
        <div style={{display:"flex",alignItems:"flex-start",gap:8,marginBottom:8}}>
          <Chip color="#fff" bg={T.red} border={T.red}>CƠ CHÍNH</Chip>
          <span style={{color:T.dark,fontSize:12,lineHeight:1.5,fontFamily:"DM Sans"}}>{ex.primary}</span>
        </div>
        <div style={{padding:"8px 12px",background:T.redLight,borderRadius:6,borderLeft:`3px solid ${T.red}`}}>
          <div style={{color:T.red,fontSize:9,fontFamily:"DM Sans",letterSpacing:1,textTransform:"uppercase",marginBottom:2}}>MỤC TIÊU</div>
          <div style={{color:T.dark,fontSize:12,fontFamily:"DM Sans",lineHeight:1.5}}>{ex.goal.substring(0,65)}{ex.goal.length>65?"...":""}</div>
        </div>
      </div>
    </div>
  );
};

// ─── Exercise Detail ─────────────────────────────────────────────────────────
const ExDetail = ({ ex, onBack }) => {
  const [tab, setTab] = useState("overview");
  const TABS = [{id:"overview",label:"Tổng quan"},{id:"body",label:"Bản đồ cơ"},{id:"technique",label:"Kỹ thuật"},{id:"mistakes",label:"Lỗi sai"},{id:"coaching",label:"Coaching"}];
  return (
    <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:16,overflow:"hidden",boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
      {/* Header */}
      <div style={{borderTop:`4px solid ${T.red}`,padding:"28px 36px",borderBottom:`1px solid ${T.border}`,background:T.bgOff}}>
        <button onClick={onBack} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontFamily:"DM Sans",fontSize:13,fontWeight:600,padding:0,marginBottom:20,display:"flex",alignItems:"center",gap:6}}>← Quay lại thư viện</button>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",flexWrap:"wrap",gap:16}}>
          <div>
            <div style={{display:"flex",gap:8,marginBottom:10,flexWrap:"wrap"}}>
              <Chip color="#fff" bg={T.red} border={T.red}>{ex.cat}</Chip>
              <Chip>{ex.phase}</Chip>
              <Chip color={T.grey} bg="transparent" border={T.border}>{ex.level}</Chip>
            </div>
            <div style={{fontSize:48,fontFamily:"Oswald",color:T.black,fontWeight:700,lineHeight:0.9,letterSpacing:1}}>{ex.name.toUpperCase()}</div>
            <div style={{color:T.grey,fontSize:15,fontFamily:"DM Sans",marginTop:8}}>{ex.vi} · {ex.eq}</div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {[["SETS",ex.sets],["REPS",ex.reps],["TEMPO",ex.tempo],["NGHỈ",ex.rest]].map(([l,v],i)=>(
              <div key={i} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 18px",textAlign:"center",minWidth:90}}>
                <div style={{fontSize:9,color:T.lightGrey,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase"}}>{l}</div>
                <div style={{fontSize:18,fontFamily:"Oswald",color:T.black,fontWeight:600,marginTop:2}}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div style={{display:"flex",borderBottom:`1px solid ${T.border}`,padding:"0 36px",overflowX:"auto"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"14px 20px",background:"none",border:"none",borderBottom:tab===t.id?`2px solid ${T.red}`:"2px solid transparent",color:tab===t.id?T.red:T.grey,cursor:"pointer",fontFamily:"DM Sans",fontSize:13,fontWeight:tab===t.id?600:400,whiteSpace:"nowrap",marginBottom:-1,transition:"color 0.15s"}}>{t.label}</button>
        ))}
      </div>
      {/* Content */}
      <div style={{padding:"28px 36px"}}>
        {tab==="overview" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            {[["NHÓM CƠ CHÍNH",ex.primary,true],["NHÓM CƠ PHỤ",ex.secondary,false],["MỤC TIÊU",ex.goal,false],["THIẾT BỊ",ex.eq,false]].map(([l,v,bold])=>(
              <div key={l} style={{padding:"18px 20px",background:T.bgOff,border:`1px solid ${T.border}`,borderRadius:10}}>
                <div style={{fontSize:10,color:T.grey,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>{l}</div>
                <div style={{color:T.black,fontSize:14,lineHeight:1.6,fontFamily:"DM Sans",fontWeight:bold?600:400}}>{v}</div>
              </div>
            ))}
            <div style={{gridColumn:"1/-1",padding:"16px 20px",background:T.bgOff,border:`1px solid ${T.border}`,borderRadius:10}}>
              <div style={{fontSize:10,color:T.grey,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase",marginBottom:12}}>BIẾN THỂ & BÀI THAY THẾ</div>
              <div style={{display:"flex",gap:24,flexWrap:"wrap"}}>
                <div><div style={{fontSize:11,color:T.grey,fontFamily:"DM Sans",marginBottom:6}}>Dễ hơn</div>{ex.alts.map((a,i)=><div key={i} style={{color:T.dark,fontSize:13,fontFamily:"DM Sans",padding:"3px 0"}}>→ {a}</div>)}</div>
                <div><div style={{fontSize:11,color:T.grey,fontFamily:"DM Sans",marginBottom:6}}>Thay thế</div>{ex.subs.map((a,i)=><div key={i} style={{color:T.dark,fontSize:13,fontFamily:"DM Sans",padding:"3px 0"}}>↔ {a}</div>)}</div>
              </div>
            </div>
          </div>
        )}
        {tab==="body" && (
          <div>
            <div style={{fontSize:11,color:T.grey,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>BẢN ĐỒ CƠ TÁC ĐỘNG</div>
            <BodyDiagram ex={ex} />
            <Divider />
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <div style={{padding:"16px 20px",background:T.redLight,border:`1px solid ${T.redMid}`,borderRadius:10,borderLeft:`4px solid ${T.red}`}}>
                <div style={{fontSize:10,color:T.red,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>CƠ CHÍNH</div>
                <div style={{color:T.dark,fontSize:14,lineHeight:1.6,fontFamily:"DM Sans",fontWeight:600}}>{ex.primary}</div>
              </div>
              <div style={{padding:"16px 20px",background:T.bgOff,border:`1px solid ${T.border}`,borderRadius:10}}>
                <div style={{fontSize:10,color:T.grey,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>CƠ PHỤ</div>
                <div style={{color:T.charcoal,fontSize:13,lineHeight:1.6,fontFamily:"DM Sans"}}>{ex.secondary}</div>
              </div>
            </div>
          </div>
        )}
        {tab==="technique" && (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
            {[["SETUP TƯ THẾ",ex.setup],["CÁCH THỰC HIỆN",ex.exec]].map(([title,steps])=>(
              <div key={title}>
                <div style={{fontSize:11,color:T.grey,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>{title}</div>
                {steps.map((s,i)=>(
                  <div key={i} style={{display:"flex",gap:14,padding:"12px 0",borderBottom:`1px solid ${T.border}`}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:i===0?T.red:T.bgOff,border:i>0?`1.5px solid ${T.red}`:"none",color:i===0?"#fff":T.red,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontFamily:"Oswald",fontWeight:600,flexShrink:0}}>{i+1}</div>
                    <span style={{color:T.dark,fontSize:13,lineHeight:1.6,fontFamily:"DM Sans",paddingTop:4}}>{s}</span>
                  </div>
                ))}
              </div>
            ))}
            <div style={{gridColumn:"1/-1",padding:"16px 20px",background:T.bgOff,border:`1px solid ${T.border}`,borderRadius:10}}>
              <div style={{fontSize:10,color:T.grey,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>NHỊP THỞ</div>
              <div style={{color:T.dark,fontSize:14,lineHeight:1.8,fontFamily:"DM Sans"}}>{ex.breath}</div>
            </div>
          </div>
        )}
        {tab==="mistakes" && (
          <div>
            <div style={{fontSize:11,color:T.grey,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase",marginBottom:20}}>LỖI SAI & CÁCH SỬA</div>
            <div style={{display:"flex",flexDirection:"column",gap:14}}>
              {ex.mistakes.map((m,i)=>(
                <div key={i} style={{display:"grid",gridTemplateColumns:"1fr 48px 1fr",gap:12,alignItems:"center"}}>
                  <div style={{padding:"16px 18px",background:"#FFF5F5",border:"1px solid #FFCCCC",borderRadius:10}}>
                    <div style={{color:"#CC0000",fontSize:10,fontFamily:"DM Sans",letterSpacing:1,textTransform:"uppercase",marginBottom:6,display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:14}}>✕</span> LỖI SAI</div>
                    <div style={{color:"#660000",fontSize:13,lineHeight:1.6,fontFamily:"DM Sans"}}>{m.w}</div>
                  </div>
                  <div style={{textAlign:"center",color:T.lightGrey,fontSize:18,fontFamily:"Oswald"}}>→</div>
                  <div style={{padding:"16px 18px",background:"#F0FFF4",border:"1px solid #BBDDCC",borderRadius:10}}>
                    <div style={{color:"#1A7A3C",fontSize:10,fontFamily:"DM Sans",letterSpacing:1,textTransform:"uppercase",marginBottom:6,display:"flex",gap:6,alignItems:"center"}}><span style={{fontSize:14}}>✓</span> CÁCH SỬA</div>
                    <div style={{color:"#0D4020",fontSize:13,lineHeight:1.6,fontFamily:"DM Sans"}}>{m.f}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab==="coaching" && (
          <div>
            <div style={{fontSize:11,color:T.grey,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase",marginBottom:20}}>COACHING CUE SEQUENCE</div>
            <div style={{padding:"20px 24px",background:T.bgOff,border:`1px solid ${T.border}`,borderRadius:10,marginBottom:20}}>
              <div style={{display:"flex",flexWrap:"wrap",gap:10,alignItems:"center"}}>
                {ex.cues.split("→").map((c,i,arr)=>(
                  <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                    <div style={{background:T.red,color:"#fff",borderRadius:6,minWidth:26,height:26,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontFamily:"Oswald",fontWeight:600,padding:"0 8px"}}>{i+1}</div>
                    <span style={{color:T.dark,fontSize:13,fontFamily:"DM Sans"}}>{c.trim()}</span>
                    {i<arr.length-1 && <span style={{color:T.lightGrey,fontSize:14}}>→</span>}
                  </div>
                ))}
              </div>
            </div>
            <div style={{padding:"16px 20px",background:T.redLight,border:`1px solid ${T.redMid}`,borderRadius:10}}>
              <div style={{color:T.red,fontSize:10,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>GHI CHÚ NỘI BỘ PT</div>
              <div style={{color:T.dark,fontSize:13,lineHeight:1.7,fontFamily:"DM Sans"}}>Điều chỉnh tải trọng và ROM theo đặc điểm cơ thể từng khách. Quan sát từ 3 góc độ. Ưu tiên form chuẩn trước khi tăng tải. Ghi lại tiến độ mỗi session.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── NASM Curriculum ─────────────────────────────────────────────────────────
const CurriculumPage = () => {
  const [activeSection, setActiveSection] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);

  const renderContent = (text) => {
    return text.split("\n").map((line,i)=>{
      if(line.startsWith("**") && line.endsWith("**")) return <div key={i} style={{fontWeight:700,color:T.black,fontFamily:"DM Sans",marginTop:14,marginBottom:4,fontSize:14}}>{line.replace(/\*\*/g,"")}</div>;
      if(line.startsWith("**")) {
        const parts = line.split("**");
        return <div key={i} style={{fontFamily:"DM Sans",fontSize:13,lineHeight:1.7,color:T.dark,marginBottom:2}}>{parts.map((p,j)=>j%2===1?<strong key={j}>{p}</strong>:p)}</div>;
      }
      if(line.startsWith("•")) return <div key={i} style={{display:"flex",gap:10,padding:"3px 0",fontFamily:"DM Sans",fontSize:13,color:T.dark,paddingLeft:12}}><span style={{color:T.red,flexShrink:0}}>•</span><span style={{lineHeight:1.6}}>{line.substring(1).trim()}</span></div>;
      if(line.startsWith("✅")||line.startsWith("❌")||line.startsWith("①")||line.startsWith("②")||line.startsWith("③")||line.startsWith("④")||line.startsWith("⑤")||line.startsWith("📌")) return <div key={i} style={{fontFamily:"DM Sans",fontSize:13,color:T.dark,padding:"4px 0",lineHeight:1.6}}>{line}</div>;
      if(line.startsWith("✓")) return <div key={i} style={{fontFamily:"DM Sans",fontSize:13,color:"#1A7A3C",padding:"2px 0",paddingLeft:8}}>{line}</div>;
      if(line.trim()==="") return <div key={i} style={{height:8}}/>;
      return <div key={i} style={{fontFamily:"DM Sans",fontSize:13,color:T.dark,lineHeight:1.7,padding:"1px 0"}}>{line}</div>;
    });
  };

  return (
    <div>
      <PageHeader label="NASM Certified" title="GIÁO TRÌNH ĐÀO TẠO PT" subtitle="National Academy of Sports Medicine · Essentials of Personal Fitness Training" />
      <div style={{display:"grid",gridTemplateColumns:activeSection?"300px 1fr":"repeat(3,1fr)",gap:20}}>
        {/* Section list */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {NASM_CURRICULUM.map(sec=>(
            <div key={sec.id} onClick={()=>{setActiveSection(activeSection?.id===sec.id?null:sec);setActiveChapter(null);}}
              style={{background:activeSection?.id===sec.id?sec.color:T.bg,border:`1px solid ${activeSection?.id===sec.id?sec.color:T.border}`,borderRadius:12,padding:"18px 20px",cursor:"pointer",transition:"all 0.18s",boxShadow:activeSection?.id===sec.id?"0 4px 20px rgba(0,0,0,0.12)":"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:24,flexShrink:0}}>{sec.icon}</span>
                <div>
                  <div style={{fontSize:16,fontFamily:"Oswald",fontWeight:600,color:activeSection?.id===sec.id?"#fff":T.black,letterSpacing:0.5}}>{sec.title}</div>
                  <div style={{fontSize:11,color:activeSection?.id===sec.id?"rgba(255,255,255,0.75)":T.grey,fontFamily:"DM Sans",marginTop:2}}>{sec.subtitle}</div>
                  <div style={{fontSize:11,color:activeSection?.id===sec.id?"rgba(255,255,255,0.6)":T.lightGrey,fontFamily:"DM Sans",marginTop:4}}>{sec.chapters.length} chương</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Chapter list & content */}
        {activeSection && (
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{padding:"18px 22px",background:activeSection.color,borderRadius:12,color:"#fff"}}>
              <div style={{fontSize:11,fontFamily:"DM Sans",opacity:0.75,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>{activeSection.subtitle}</div>
              <div style={{fontSize:28,fontFamily:"Oswald",fontWeight:700,letterSpacing:1}}>{activeSection.title.toUpperCase()}</div>
            </div>
            {activeSection.chapters.map((ch,i)=>(
              <div key={i} style={{background:T.bg,border:`1px solid ${activeChapter===i?activeSection.color:T.border}`,borderRadius:12,overflow:"hidden",transition:"border-color 0.15s"}}>
                <div onClick={()=>setActiveChapter(activeChapter===i?null:i)}
                  style={{padding:"16px 22px",cursor:"pointer",display:"flex",justifyContent:"space-between",alignItems:"center",background:activeChapter===i?`${activeSection.color}08`:T.bg}}>
                  <div>
                    <div style={{fontSize:10,color:T.lightGrey,fontFamily:"DM Sans",letterSpacing:1,textTransform:"uppercase",marginBottom:4}}>CHƯƠNG {i+1}</div>
                    <div style={{fontSize:15,fontFamily:"Oswald",color:activeChapter===i?activeSection.color:T.black,fontWeight:500,letterSpacing:0.3}}>{ch.title}</div>
                  </div>
                  <div style={{color:activeChapter===i?activeSection.color:T.lightGrey,fontSize:18,fontFamily:"Oswald",flexShrink:0}}>{activeChapter===i?"−":"+"}</div>
                </div>
                {activeChapter===i && (
                  <div style={{padding:"4px 22px 24px",borderTop:`1px solid ${T.border}`}}>
                    <div style={{marginTop:16}}>{renderContent(ch.content)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {!activeSection && (
          <div style={{gridColumn:"span 2",display:"flex",alignItems:"center",justifyContent:"center",padding:60,color:T.lightGrey,textAlign:"center"}}>
            <div>
              <div style={{fontSize:48,marginBottom:12}}>📖</div>
              <div style={{fontFamily:"Oswald",fontSize:20,letterSpacing:1}}>Chọn một phần để xem nội dung</div>
              <div style={{fontFamily:"DM Sans",fontSize:13,marginTop:6}}>6 phần · 24 chương · Chuẩn NASM CPT</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── AI Meal Search ──────────────────────────────────────────────────────────
const MealSearch = () => {
  const [messages, setMessages] = useState([{role:"assistant",content:"Xin chào! Tôi là chuyên gia dinh dưỡng thể thao AI. Bạn có thể hỏi tôi bất kỳ câu hỏi nào về:\n• Thực đơn cho mục tiêu cụ thể (giảm mỡ, tăng cơ...)\n• Tính toán calories, macro\n• Thực phẩm tốt cho tập luyện\n• Thực đơn 7 ngày chi tiết\n• Giải thích về dinh dưỡng\n\nHãy hỏi bất cứ điều gì!"}]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [formMode, setFormMode] = useState(false);
  const [form, setForm] = useState({goal:"Giảm mỡ",gender:"Nam",weight:"",age:"",kcal:"1800",days:"7",allergies:""});
  const bottomRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  const send = async (textOverride) => {
    const text = textOverride || input.trim();
    if (!text || loading) return;
    setInput(""); setLoading(true);
    const newMessages = [...messages, {role:"user",content:text}];
    setMessages(newMessages);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:"Bạn là chuyên gia dinh dưỡng thể thao chuẩn NASM, nói tiếng Việt. Tư vấn thực đơn, dinh dưỡng thể thao thực chiến, có số liệu cụ thể. Dùng thực phẩm Việt Nam phổ biến. Không quá dài dòng. Khi tạo thực đơn, ghi rõ gram và macro (P/C/F) từng bữa.",
          messages: newMessages.map(m=>({role:m.role,content:m.content}))
        })
      });
      const data = await res.json();
      setMessages([...newMessages, {role:"assistant",content:data.content?.[0]?.text||"Xin lỗi, có lỗi xảy ra."}]);
    } catch { setMessages([...newMessages, {role:"assistant",content:"Lỗi kết nối. Vui lòng thử lại."}]); }
    setLoading(false);
  };

  const genMealPlan = async () => {
    const prompt = `Tạo thực đơn ${form.days} ngày chi tiết cho:\n• Giới tính: ${form.gender}, ${form.weight||"?"}kg, ${form.age||"?"}tuổi\n• Mục tiêu: ${form.goal}\n• Calories mục tiêu: ${form.kcal} kcal/ngày${form.allergies?`\n• Kiêng: ${form.allergies}`:""}\n\nMỗi ngày: Sáng/Trưa/Tối/Bữa phụ với thực phẩm Việt Nam, gram cụ thể và macro P/C/F. Tổng macro cuối ngày.`;
    setFormMode(false);
    send(prompt);
  };

  const QUICK = ["Thực đơn giảm mỡ 1800 kcal/ngày","Tính TDEE cho nam 70kg tập 4 buổi/tuần","Thực phẩm giàu protein rẻ tiền tại Việt Nam","Ăn gì trước và sau tập?","Creatine dùng thế nào cho đúng?"];

  const inputS = {background:T.bg,border:`1px solid ${T.border}`,color:T.black,padding:"10px 14px",borderRadius:8,fontFamily:"DM Sans",fontSize:14,width:"100%",boxSizing:"border-box",outline:"none"};
  const labelS = {fontSize:11,color:T.grey,fontFamily:"DM Sans",letterSpacing:1,textTransform:"uppercase",marginBottom:6,display:"block"};

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:28,flexWrap:"wrap",gap:16}}>
        <PageHeader label="AI Powered" title="THỰC ĐƠN DINH DƯỠNG" subtitle="Hỏi bất kỳ câu hỏi dinh dưỡng nào · Tạo thực đơn theo yêu cầu" />
        <button onClick={()=>setFormMode(!formMode)} style={{background:formMode?T.bgOff:T.red,color:formMode?T.grey:"#fff",border:`1px solid ${formMode?T.border:T.red}`,padding:"10px 22px",borderRadius:8,cursor:"pointer",fontFamily:"DM Sans",fontSize:13,fontWeight:600,flexShrink:0}}>
          {formMode?"✕ Đóng":"🥗 Tạo thực đơn chi tiết"}
        </button>
      </div>

      {formMode && (
        <div style={{background:T.bgOff,border:`1px solid ${T.border}`,borderRadius:12,padding:24,marginBottom:24}}>
          <div style={{fontSize:11,color:T.red,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase",marginBottom:16}}>TẠO THỰC ĐƠN TỰ ĐỘNG</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {[["MỤC TIÊU","goal","select",["Giảm mỡ","Tăng cơ","Duy trì","Tăng cân sạch","Phục hồi"]],["GIỚI TÍNH","gender","select",["Nam","Nữ"]],["CALORIES/NGÀY","kcal","select",["1400","1600","1800","2000","2200","2500","2800","3000"]],["CÂN NẶNG (kg)","weight","text","70"],["TUỔI","age","text","25"],["SỐ NGÀY","days","select",["3","5","7","14"]]].map(([l,k,t,opts])=>(
              <div key={k}><label style={labelS}>{l}</label>
                {t==="select" ? <select style={{...inputS,appearance:"none"}} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}>{(opts).map(o=><option key={o}>{o}{k==="kcal"?" kcal":k==="days"?" ngày":""}</option>)}</select>
                : <input style={inputS} placeholder={opts} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} />}
              </div>
            ))}
            <div style={{gridColumn:"1/-1"}}><label style={labelS}>DỊ ỨNG / KIÊNG CỮ</label><input style={inputS} placeholder="không hải sản, không đậu phộng..." value={form.allergies} onChange={e=>setForm({...form,allergies:e.target.value})} /></div>
          </div>
          <button onClick={genMealPlan} style={{marginTop:20,background:T.red,color:"#fff",border:"none",padding:"12px 32px",borderRadius:8,cursor:"pointer",fontFamily:"DM Sans",fontSize:14,fontWeight:600}}>Tạo thực đơn →</button>
        </div>
      )}

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div style={{marginBottom:20}}>
          <div style={{fontSize:11,color:T.grey,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>GỢI Ý NHANH</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {QUICK.map((q,i)=><button key={i} onClick={()=>send(q)} style={{background:T.bg,border:`1px solid ${T.border}`,color:T.dark,padding:"8px 14px",borderRadius:8,cursor:"pointer",fontFamily:"DM Sans",fontSize:12,transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=T.red;e.currentTarget.style.color=T.red;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.dark;}}>{q}</button>)}
          </div>
        </div>
      )}

      {/* Chat */}
      <div style={{background:T.bgOff,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
        <div style={{maxHeight:500,overflowY:"auto",padding:"20px 24px",display:"flex",flexDirection:"column",gap:16}}>
          {messages.map((m,i)=>(
            <div key={i} style={{display:"flex",gap:12,flexDirection:m.role==="user"?"row-reverse":"row"}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:m.role==="user"?T.black:T.red,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,fontFamily:"Oswald",fontWeight:700}}>
                {m.role==="user"?"PT":"AI"}
              </div>
              <div style={{maxWidth:"75%",padding:"14px 18px",background:m.role==="user"?T.black:T.bg,border:`1px solid ${m.role==="user"?"transparent":T.border}`,borderRadius:12,color:m.role==="user"?"#fff":T.dark,fontSize:13,lineHeight:1.8,fontFamily:"DM Sans",whiteSpace:"pre-wrap"}}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div style={{display:"flex",gap:12}}>
              <div style={{width:36,height:36,borderRadius:"50%",background:T.red,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,fontFamily:"Oswald",fontWeight:700}}>AI</div>
              <div style={{padding:"14px 18px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,color:T.grey,fontSize:13,fontFamily:"DM Sans"}}>Đang phân tích...</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={{borderTop:`1px solid ${T.border}`,padding:"16px 20px",display:"flex",gap:10}}>
          <input style={{...inputS,flex:1,borderRadius:8}} placeholder="Hỏi về dinh dưỡng, thực đơn, calories..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} />
          <button onClick={()=>send()} disabled={loading||!input.trim()} style={{background:loading||!input.trim()?"#E8E8E8":T.red,color:loading||!input.trim()?T.lightGrey:"#fff",border:"none",padding:"10px 24px",borderRadius:8,cursor:loading||!input.trim()?"not-allowed":"pointer",fontFamily:"DM Sans",fontSize:14,fontWeight:600,flexShrink:0}}>Gửi</button>
        </div>
      </div>
    </div>
  );
};

// ─── Client Manager ──────────────────────────────────────────────────────────
const Clients = ({ onSelectClient }) => {
  const [clients, setClients] = useState([]); const [showForm, setShowForm] = useState(false); const [loading, setLoading] = useState(true); const [selected, setSelected] = useState(null); const [clientData, setClientData] = useState(null);
  const [form, setForm] = useState({name:"",age:"",gender:"Nam",goal:"Giảm mỡ",level:"Cơ bản",notes:"",phone:""});
  useEffect(()=>{loadClients();},[]);
  const loadClients = async () => { setLoading(true); const c = await store.get("pt_clients_v2"); setClients(c||[]); setLoading(false); };
  const saveClients = async (list) => { setClients(list); await store.set("pt_clients_v2", list); };
  const addClient = async () => { if(!form.name.trim()) return; const c = {...form,id:Date.now().toString(),createdAt:new Date().toLocaleDateString("vi-VN")}; await saveClients([...clients,c]); setForm({name:"",age:"",gender:"Nam",goal:"Giảm mỡ",level:"Cơ bản",notes:"",phone:""}); setShowForm(false); };
  const deleteClient = async (id) => { if(!confirm("Xóa khách hàng?")) return; await saveClients(clients.filter(c=>c.id!==id)); if(selected?.id===id){setSelected(null);setClientData(null);} };
  const viewClient = async (client) => { setSelected(client); const plan = await store.get(`plan_${client.id}`); const meal = await store.get(`meal_${client.id}`); setClientData({plan:plan?.text||null,meal:meal?.text||null,planDate:plan?.date||null,mealDate:meal?.date||null}); };

  const inputS = {background:T.bg,border:`1px solid ${T.border}`,color:T.black,padding:"10px 14px",borderRadius:8,fontFamily:"DM Sans",fontSize:13,width:"100%",boxSizing:"border-box",outline:"none"};
  const labelS = {fontSize:11,color:T.grey,fontFamily:"DM Sans",letterSpacing:1,textTransform:"uppercase",marginBottom:6,display:"block"};

  if (selected && clientData) return (
    <div>
      <button onClick={()=>{setSelected(null);setClientData(null);}} style={{background:"none",border:"none",color:T.red,cursor:"pointer",fontFamily:"DM Sans",fontSize:13,fontWeight:600,marginBottom:24,padding:0}}>← Danh sách khách</button>
      <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:24}}>
        <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:24,height:"fit-content"}}>
          <div style={{width:56,height:56,background:T.red,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontFamily:"Oswald",fontWeight:700,color:"#fff",marginBottom:16}}>{selected.name.charAt(0)}</div>
          <div style={{fontSize:22,fontFamily:"Oswald",color:T.black,fontWeight:600}}>{selected.name}</div>
          <div style={{color:T.grey,fontSize:12,fontFamily:"DM Sans",marginTop:2}}>Từ {selected.createdAt}</div>
          <Divider />
          {[["Tuổi",selected.age||"—"],["Giới tính",selected.gender],["Mục tiêu",selected.goal],["Trình độ",selected.level],["Phone",selected.phone||"—"]].map(([l,v])=>(
            <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
              <span style={{color:T.grey,fontSize:12,fontFamily:"DM Sans"}}>{l}</span>
              <span style={{color:T.black,fontSize:13,fontFamily:"DM Sans",fontWeight:500}}>{v}</span>
            </div>
          ))}
          {selected.notes && <div style={{marginTop:12,padding:"10px 12px",background:T.bgOff,borderRadius:8,color:T.grey,fontSize:12,fontFamily:"DM Sans",lineHeight:1.6}}>{selected.notes}</div>}
          <button onClick={()=>onSelectClient(selected)} style={{marginTop:16,width:"100%",background:T.red,color:"#fff",border:"none",padding:"12px 0",borderRadius:8,cursor:"pointer",fontFamily:"DM Sans",fontSize:14,fontWeight:600}}>⚡ Tạo giáo án mới</button>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:16}}>
          {[{key:"plan",title:"GIÁO ÁN MỚI NHẤT",icon:"📋",date:clientData.planDate,content:clientData.plan},{key:"meal",title:"THỰC ĐƠN MỚI NHẤT",icon:"🥗",date:clientData.mealDate,content:clientData.meal}].map(({key,title,icon,date,content})=>(
            <div key={key} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:24}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div><div style={{fontSize:11,color:T.grey,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase"}}>{date?`Cập nhật: ${date}`:"Chưa có"}</div><div style={{fontSize:20,fontFamily:"Oswald",color:T.black,fontWeight:600,marginTop:2}}>{icon} {title}</div></div>
                {content && <button onClick={()=>{const b=new Blob([content],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`${key}_${selected.name}.txt`;a.click();}} style={{background:T.bgOff,border:`1px solid ${T.border}`,color:T.grey,padding:"7px 14px",borderRadius:8,cursor:"pointer",fontFamily:"DM Sans",fontSize:12}}>💾 Tải</button>}
              </div>
              {content ? <div style={{background:T.bgOff,border:`1px solid ${T.border}`,borderRadius:8,padding:"16px 20px",color:T.dark,fontSize:13,lineHeight:1.9,fontFamily:"DM Sans",whiteSpace:"pre-wrap",maxHeight:250,overflowY:"auto"}}>{content}</div>
              : <div style={{textAlign:"center",color:T.lightGrey,padding:"30px 0",fontFamily:"DM Sans",fontSize:13}}>Chưa có {key==="plan"?"giáo án":"thực đơn"}.</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:28,flexWrap:"wrap",gap:16}}>
        <PageHeader label={`${clients.length} khách hàng`} title="QUẢN LÝ KHÁCH HÀNG" />
        <button onClick={()=>setShowForm(!showForm)} style={{background:showForm?T.bgOff:T.red,color:showForm?T.grey:"#fff",border:`1px solid ${showForm?T.border:T.red}`,padding:"10px 22px",borderRadius:8,cursor:"pointer",fontFamily:"DM Sans",fontSize:13,fontWeight:600,flexShrink:0}}>
          {showForm?"✕ Hủy":"+ Thêm khách"}
        </button>
      </div>
      {showForm && (
        <div style={{background:T.bgOff,border:`1px solid ${T.border}`,borderRadius:12,padding:24,marginBottom:24}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16}}>
            {[["TÊN KHÁCH HÀNG","name","text","Nguyễn Văn A"],["TUỔI","age","number","25"],["SỐ ĐIỆN THOẠI","phone","text","090..."]].map(([l,k,t,ph])=>(
              <div key={k}><label style={labelS}>{l}</label><input type={t} style={inputS} placeholder={ph} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} /></div>
            ))}
            {[["GIỚI TÍNH","gender",["Nam","Nữ"]],["MỤC TIÊU","goal",["Giảm mỡ","Tăng cơ","Tăng sức mạnh","Cải thiện sức bền","Phục hồi"]],["TRÌNH ĐỘ","level",["Cơ bản","Trung bình","Nâng cao"]]].map(([l,k,opts])=>(
              <div key={k}><label style={labelS}>{l}</label><select style={{...inputS,appearance:"none"}} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}>{opts.map(o=><option key={o}>{o}</option>)}</select></div>
            ))}
            <div style={{gridColumn:"1/-1"}}><label style={labelS}>GHI CHÚ (chấn thương, yêu cầu đặc biệt)</label><textarea style={{...inputS,height:68,resize:"vertical"}} placeholder="đau lưng dưới, không có máy kéo xô..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
          </div>
          <button onClick={addClient} disabled={!form.name.trim()} style={{marginTop:16,background:T.red,color:"#fff",border:"none",padding:"11px 28px",borderRadius:8,cursor:form.name.trim()?"pointer":"not-allowed",fontFamily:"DM Sans",fontSize:14,fontWeight:600}}>Lưu khách hàng</button>
        </div>
      )}
      {loading ? <div style={{textAlign:"center",padding:60,color:T.lightGrey,fontFamily:"DM Sans"}}>Đang tải...</div>
      : clients.length===0 ? (
        <div style={{textAlign:"center",padding:80,color:T.lightGrey}}>
          <div style={{fontSize:48,marginBottom:16}}>👥</div>
          <div style={{fontFamily:"Oswald",fontSize:22,letterSpacing:1}}>Chưa có khách hàng</div>
          <div style={{fontFamily:"DM Sans",fontSize:13,marginTop:6}}>Nhấn "+ Thêm khách" để bắt đầu</div>
        </div>
      ) : (
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
          {clients.map(c=>(
            <div key={c.id} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:20,transition:"all 0.15s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#999";e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,0.08)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow="none";}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
                <div style={{display:"flex",gap:12,alignItems:"center"}}>
                  <div style={{width:44,height:44,background:T.red,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontFamily:"Oswald",fontWeight:700,color:"#fff",flexShrink:0}}>{c.name.charAt(0)}</div>
                  <div><div style={{fontSize:18,fontFamily:"Oswald",color:T.black,fontWeight:600}}>{c.name}</div><div style={{color:T.grey,fontSize:11,fontFamily:"DM Sans"}}>{c.age?`${c.age} tuổi · `:""}{c.gender}</div></div>
                </div>
                <button onClick={e=>{e.stopPropagation();deleteClient(c.id);}} style={{background:"none",border:`1px solid ${T.border}`,color:T.lightGrey,width:28,height:28,borderRadius:6,cursor:"pointer",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center"}}>✕</button>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                <Chip>{c.goal}</Chip><Chip color={T.grey} bg="transparent" border={T.border}>{c.level}</Chip>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>viewClient(c)} style={{flex:1,background:T.bgOff,border:`1px solid ${T.border}`,color:T.dark,padding:"9px 0",borderRadius:8,cursor:"pointer",fontFamily:"DM Sans",fontSize:12,fontWeight:500}}>Xem chi tiết</button>
                <button onClick={()=>onSelectClient(c)} style={{flex:1,background:T.redLight,border:`1px solid ${T.redMid}`,color:T.red,padding:"9px 0",borderRadius:8,cursor:"pointer",fontFamily:"DM Sans",fontSize:12,fontWeight:600}}>⚡ Tạo giáo án</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Plan Generator ──────────────────────────────────────────────────────────
const PlanGen = ({ presetClient }) => {
  const [form, setForm] = useState({name:presetClient?.name||"",goal:presetClient?.goal||"Giảm mỡ",level:presetClient?.level||"Cơ bản",days:"3",weeks:"4",notes:presetClient?.notes||""});
  const [result, setResult] = useState(""); const [loading, setLoading] = useState(false); const [saved, setSaved] = useState(false);
  useEffect(()=>{if(presetClient)setForm(f=>({...f,name:presetClient.name,goal:presetClient.goal,level:presetClient.level,notes:presetClient.notes||""}));},[presetClient]);
  const phaseMap = {"Cơ bản":"Phase 1 – Stabilization Endurance","Trung bình":"Phase 2 – Strength Endurance","Nâng cao":"Phase 3 – Hypertrophy / Phase 4 – Maximal Strength"};
  const generate = async () => {
    if(!form.name.trim()) return; setLoading(true); setResult(""); setSaved(false);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:`Bạn là Master Trainer chuẩn NASM OPT. Tạo giáo án ${form.weeks} tuần:\nKhách: ${form.name} · ${form.goal} · ${form.level} (${phaseMap[form.level]}) · ${form.days} ngày/tuần${form.notes?` · Ghi chú: ${form.notes}`:""}\n\nFormat: Mỗi ngày tập → Warm-up 5p → Bài chính (Tên | Sets×Reps | Tempo | Nghỉ | Cue kỹ thuật ngắn) → Cool-down 5p. Cuối 2 tuần ghi progression. Tiếng Việt, thực chiến, số liệu cụ thể.`}]})});
      const data = await res.json(); setResult(data.content?.[0]?.text||"Lỗi.");
    } catch { setResult("Lỗi kết nối API."); } setLoading(false);
  };
  const saveToClient = async () => { if(!presetClient||!result) return; await store.set(`plan_${presetClient.id}`,{text:result,date:new Date().toLocaleDateString("vi-VN")}); setSaved(true); };
  const exportTxt = () => { const b=new Blob([`GIÁO ÁN: ${form.name}\n${form.goal} · ${form.level} · ${form.days} ngày/tuần · ${form.weeks} tuần\n\n${result}`],{type:"text/plain"}); const a=document.createElement("a"); a.href=URL.createObjectURL(b); a.download=`giaoan_${form.name.replace(/\s/g,"_")}.txt`; a.click(); };
  const inputS = {background:T.bg,border:`1px solid ${T.border}`,color:T.black,padding:"10px 14px",borderRadius:8,fontFamily:"DM Sans",fontSize:13,width:"100%",boxSizing:"border-box",outline:"none"};
  const labelS = {fontSize:11,color:T.grey,fontFamily:"DM Sans",letterSpacing:1,textTransform:"uppercase",marginBottom:6,display:"block"};
  return (
    <div style={{display:"grid",gridTemplateColumns:"340px 1fr",gap:24,alignItems:"start"}}>
      <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:28,position:"sticky",top:0}}>
        <div style={{fontSize:11,color:T.red,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>NASM OPT Model</div>
        <div style={{fontSize:28,fontFamily:"Oswald",color:T.black,fontWeight:700,letterSpacing:1,marginBottom:24}}>TẠO GIÁO ÁN AI</div>
        {presetClient && <div style={{background:T.redLight,border:`1px solid ${T.redMid}`,borderRadius:8,padding:"10px 14px",marginBottom:20,color:T.red,fontSize:12,fontFamily:"DM Sans",fontWeight:500}}>👤 {presetClient.name}</div>}
        <div style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label style={labelS}>Tên khách hàng</label><input style={inputS} placeholder="Nguyễn Văn A" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
          <div><label style={labelS}>Mục tiêu</label><select style={{...inputS,appearance:"none"}} value={form.goal} onChange={e=>setForm({...form,goal:e.target.value})}>{["Giảm mỡ","Tăng cơ (Hypertrophy)","Tăng sức mạnh","Cải thiện sức bền","Phục hồi chấn thương","Cải thiện tư thế"].map(o=><option key={o}>{o}</option>)}</select></div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            <div><label style={labelS}>Trình độ</label><select style={{...inputS,appearance:"none"}} value={form.level} onChange={e=>setForm({...form,level:e.target.value})}>{["Cơ bản","Trung bình","Nâng cao"].map(o=><option key={o}>{o}</option>)}</select></div>
            <div><label style={labelS}>Ngày/tuần</label><select style={{...inputS,appearance:"none"}} value={form.days} onChange={e=>setForm({...form,days:e.target.value})}>{["2","3","4","5","6"].map(o=><option key={o}>{o} ngày</option>)}</select></div>
          </div>
          <div><label style={labelS}>Số tuần</label><select style={{...inputS,appearance:"none"}} value={form.weeks} onChange={e=>setForm({...form,weeks:e.target.value})}>{["4","6","8","12"].map(o=><option key={o}>{o} tuần</option>)}</select></div>
          <div><label style={labelS}>Ghi chú thêm</label><textarea style={{...inputS,height:64,resize:"vertical"}} placeholder="đau lưng dưới, không có máy..." value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} /></div>
          <button onClick={generate} disabled={loading||!form.name.trim()} style={{background:loading?"#E8E8E8":T.red,color:loading?T.grey:"#fff",border:"none",padding:"13px",borderRadius:8,cursor:loading||!form.name.trim()?"not-allowed":"pointer",fontFamily:"DM Sans",fontSize:15,fontWeight:700}}>
            {loading?"Đang tạo giáo án...":"Tạo giáo án ⚡"}
          </button>
        </div>
      </div>
      <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:12,padding:28,minHeight:500}}>
        {!result&&!loading&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:400,color:T.lightGrey,textAlign:"center"}}><div style={{fontSize:44,marginBottom:12}}>📋</div><div style={{fontFamily:"Oswald",fontSize:20,letterSpacing:1}}>Điền thông tin và nhấn Tạo giáo án</div></div>}
        {loading&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:400,color:T.red}}><div style={{fontSize:32,marginBottom:12}}>⚙️</div><div style={{fontFamily:"Oswald",fontSize:20,letterSpacing:1}}>ĐANG TẠO GIÁO ÁN...</div><div style={{color:T.grey,fontSize:12,marginTop:6,fontFamily:"DM Sans"}}>Theo tiêu chuẩn NASM OPT Model</div></div>}
        {result&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20,flexWrap:"wrap",gap:10}}>
              <div><div style={{fontSize:11,color:T.red,fontFamily:"DM Sans",letterSpacing:2,textTransform:"uppercase"}}>{form.level.toUpperCase()} · {form.weeks} TUẦN · NASM</div><div style={{fontSize:22,fontFamily:"Oswald",color:T.black,fontWeight:700,marginTop:2}}>{form.name.toUpperCase()}</div></div>
              <div style={{display:"flex",gap:8}}>
                {presetClient&&<button onClick={saveToClient} style={{background:saved?"#059669":T.bgOff,color:saved?"#fff":T.grey,border:`1px solid ${saved?"#059669":T.border}`,padding:"8px 14px",borderRadius:8,cursor:"pointer",fontFamily:"DM Sans",fontSize:12}}>{saved?"✓ Đã lưu vào hồ sơ":"💾 Lưu vào hồ sơ"}</button>}
                <button onClick={exportTxt} style={{background:T.bgOff,border:`1px solid ${T.border}`,color:T.grey,padding:"8px 14px",borderRadius:8,cursor:"pointer",fontFamily:"DM Sans",fontSize:12}}>📥 Tải .txt</button>
                <button onClick={()=>navigator.clipboard?.writeText(result)} style={{background:T.bgOff,border:`1px solid ${T.border}`,color:T.grey,padding:"8px 14px",borderRadius:8,cursor:"pointer",fontFamily:"DM Sans",fontSize:12}}>📋 Copy</button>
              </div>
            </div>
            <div style={{background:T.bgOff,border:`1px solid ${T.border}`,borderRadius:10,padding:"18px 22px",color:T.dark,fontSize:13,lineHeight:1.9,fontFamily:"DM Sans",whiteSpace:"pre-wrap",maxHeight:600,overflowY:"auto"}}>{result}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── App Shell ───────────────────────────────────────────────────────────────
export default function PTApp() {
  const [page, setPage] = useState("library"); const [selectedEx, setSelectedEx] = useState(null); const [filter, setFilter] = useState("TẤT CẢ"); const [search, setSearch] = useState(""); const [presetClient, setPresetClient] = useState(null);
  useEffect(()=>{injectFonts();},[]);
  const handleSelectClient = (c) => { setPresetClient(c); setPage("plan"); };
  const filtered = EX.filter(ex=>{ const matchCat=filter==="TẤT CẢ"||ex.cat===filter; const q=search.toLowerCase(); const matchQ=!q||ex.name.toLowerCase().includes(q)||ex.vi.toLowerCase().includes(q)||ex.primary.toLowerCase().includes(q)||ex.cat.toLowerCase().includes(q); return matchCat&&matchQ; });

  const NAV = [
    {id:"library",icon:"◈",label:"Thư viện bài tập",sub:`${EX.length} bài tập`},
    {id:"curriculum",icon:"◉",label:"Giáo trình NASM",sub:"6 phần · 24 chương"},
    {id:"clients",icon:"◎",label:"Khách hàng",sub:"Quản lý hồ sơ"},
    {id:"plan",icon:"◐",label:"Tạo giáo án",sub:"AI · NASM OPT"},
    {id:"meal",icon:"◑",label:"Dinh dưỡng AI",sub:"Tra cứu thực đơn"},
  ];

  return (
    <div style={{background:T.bg,minHeight:"100vh",display:"flex",fontFamily:"DM Sans",color:T.black}}>
      {/* Sidebar */}
      <div style={{width:220,background:T.sidebar,display:"flex",flexDirection:"column",position:"fixed",top:0,left:0,height:"100vh",zIndex:100}}>
        <div style={{padding:"28px 22px 24px",borderBottom:"1px solid #2a2a2a"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
            <div style={{width:28,height:28,background:T.red,borderRadius:4,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:12,height:12,border:"2px solid #fff",borderRadius:"50%"}} />
            </div>
            <div style={{color:"#fff",fontSize:16,fontFamily:"Oswald",fontWeight:700,letterSpacing:2}}>Academy PT by Master Armin HuyTran</div>
          </div>
          <div style={{color:"#555",fontSize:10,fontFamily:"DM Sans",letterSpacing:1.5}}>NASM STANDARD · INTERNAL</div>
        </div>
        <nav style={{flex:1,padding:"16px 12px"}}>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>{setPage(n.id);setSelectedEx(null);if(n.id!=="plan")setPresetClient(null);}}
              style={{width:"100%",textAlign:"left",display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:8,marginBottom:3,background:page===n.id?"#2a2a2a":"none",border:page===n.id?"1px solid #3a3a3a":"1px solid transparent",color:page===n.id?"#fff":T.sidebarText,cursor:"pointer",fontFamily:"DM Sans",fontSize:12,fontWeight:page===n.id?600:400,transition:"all 0.12s"}}>
              <span style={{fontSize:14,color:page===n.id?T.red:T.sidebarText}}>{n.icon}</span>
              <div style={{flex:1}}>
                <div>{n.label}</div>
                <div style={{fontSize:10,color:"#444",marginTop:1}}>{n.sub}</div>
              </div>
              {page===n.id && <div style={{width:4,height:4,borderRadius:"50%",background:T.red}} />}
            </button>
          ))}
        </nav>
        <div style={{padding:"16px 22px",borderTop:"1px solid #222"}}>
          <div style={{color:"#2a2a2a",fontSize:9,fontFamily:"DM Sans",lineHeight:1.6,letterSpacing:0.5}}>© PT Internal Tool<br/>Tài liệu nội bộ · v3.0</div>
        </div>
      </div>

      {/* Content */}
      <div style={{marginLeft:220,flex:1,padding:"36px 40px",maxWidth:"calc(100vw - 220px)",boxSizing:"border-box"}}>
        {page==="library" && (
          selectedEx ? <ExDetail ex={selectedEx} onBack={()=>setSelectedEx(null)} /> : (
            <div>
              <PageHeader label={`${filtered.length} bài tập`} title="THƯ VIỆN BÀI TẬP" subtitle="Chuẩn NASM · Kỹ thuật chi tiết · Bản đồ cơ tương tác" />
              <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap",alignItems:"center"}}>
                <input style={{background:T.bg,border:`1px solid ${T.border}`,color:T.black,padding:"9px 14px",borderRadius:8,fontFamily:"DM Sans",fontSize:13,outline:"none",width:220}} placeholder="Tìm bài tập..." value={search} onChange={e=>setSearch(e.target.value)} />
                <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                  {CATS.map(cat=><button key={cat} onClick={()=>setFilter(cat)} style={{padding:"7px 12px",borderRadius:6,cursor:"pointer",background:filter===cat?T.red:T.bg,border:`1px solid ${filter===cat?T.red:T.border}`,color:filter===cat?"#fff":T.grey,fontFamily:"DM Sans",fontSize:11,fontWeight:filter===cat?600:400,transition:"all 0.12s"}}>{cat}</button>)}
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
                {filtered.map(ex=><ExCard key={ex.id} ex={ex} onClick={setSelectedEx} />)}
              </div>
              {filtered.length===0&&<div style={{textAlign:"center",color:T.lightGrey,padding:"60px 0"}}><div style={{fontSize:36,marginBottom:10}}>🔍</div><div style={{fontFamily:"Oswald",fontSize:20}}>Không tìm thấy bài tập</div></div>}
            </div>
          )
        )}
        {page==="curriculum" && <CurriculumPage />}
        {page==="clients" && <Clients onSelectClient={handleSelectClient} />}
        {page==="plan" && <PlanGen presetClient={presetClient} />}
        {page==="meal" && <MealSearch />}
      </div>

      <style>{`
        * { box-sizing: border-box; }
        select option { background: #fff; color: #111; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #F7F7F7; }
        ::-webkit-scrollbar-thumb { background: #DDDDDD; border-radius: 3px; }
        input::placeholder { color: #BBBBBB; }
        textarea::placeholder { color: #BBBBBB; }
        button { transition: all 0.15s ease; }
      `}</style>
    </div>
  );
}
