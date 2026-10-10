import {normalizeImageCrop} from './imageCrop.js';
export const genders=['male','female','nonbinary','other','preferNot'];
export function safeProfilePhoto(value){return typeof value==='string'&&value.length<=1500000&&/^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(value)?value:'';}
export function safeBirthDate(value){if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(value))return '';const [y,m,d]=value.split('-').map(Number);const date=new Date(y,m-1,d);return y>=1900&&date.getFullYear()===y&&date.getMonth()===m-1&&date.getDate()===d?value:'';}
export function profileDetails(profile){return {firstName:String(profile.firstName||'').slice(0,80),lastName:String(profile.lastName||'').slice(0,80),birthDate:safeBirthDate(profile.birthDate),gender:genders.includes(profile.gender)?profile.gender:'',photo:safeProfilePhoto(profile.photo),coverPhoto:safeProfilePhoto(profile.coverPhoto),photoCrop:normalizeImageCrop(profile.photoCrop),coverPhotoCrop:normalizeImageCrop(profile.coverPhotoCrop)};}
export function passwordIssue(password,confirmation){return password.length<8?'passwordShort':password!==confirmation?'passwordMismatch':null;}
