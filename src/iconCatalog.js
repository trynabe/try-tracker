export const iconChoices = [
 ['exercise','Exercise','ออกกำลังกาย',['🏋','🏃','💪','🤸','🧗','⚽','🏸']],
 ['study','Study','การเรียน',['🧠']],
 ['health','Health','สุขภาพ',['💊','🦷','👀']],
 ['gaming','Gaming','เล่นเกม',['🎮','🧩']],
 ['book','Reading','อ่านหนังสือ',['📚','📖']],
 ['code','Coding','เขียนโค้ด',['💻','👩‍💻']],
 ['water','Water','ดื่มน้ำ',['💧','🥛']],
 ['food','Nutrition','อาหาร',['🍎','🍏','🥗','🥑','🍳','🍔','🍕','🧂']],
 ['sleep','Sleep','นอนหลับ',['🛌','💤']],
 ['meditate','Meditation','สมาธิ',['🧘']],
 ['walking','Walking','เดิน',['🚶']],
 ['cycling','Cycling','ปั่นจักรยาน',['🚴']],
 ['swimming','Swimming','ว่ายน้ำ',['🏊']],
 ['notes','Journaling','จดบันทึก',['✍','📓']],
 ['music','Music','ดนตรี',['🎶','🎸']],
 ['art','Art','ศิลปะ',['🎨']],
 ['work','Work','ทำงาน',['💼']],
 ['money','Finance','การเงิน',['💸','🛍']],
 ['home','Home','บ้าน',['🧹','🧺']],
 ['plant','Nature','ธรรมชาติ',['🌱','🍀']],
 ['phone','Digital life','ดิจิทัล',['📱','📵','📺','📞','🚫']],
 ['coffee','Coffee','กาแฟ',['☕']],
 ['time','Time','เวลา',['⏳','📅','⏰','🌅']],
 ['target','Goals','เป้าหมาย',['🎯','⚡']],
 ['rocket','Progress','ความก้าวหน้า',['🚀']],
 ['user','Profile','โปรไฟล์',['👤','🦊','🦁','🕶','🧙','🐶']],
 ['smoking','No smoking','งดสูบบุหรี่',['🚭']]
].map(([id,en,th,legacy])=>({id,en,th,legacy}));
export function resolveIcon(value,fallback='target'){
 if(iconChoices.some(icon=>icon.id===value))return value;
 const legacy=String(value||'');
 return iconChoices.find(icon=>icon.legacy.some(symbol=>legacy.includes(symbol)))?.id||fallback;
}
