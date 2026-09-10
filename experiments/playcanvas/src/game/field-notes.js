export function normalizeJournalData(data, areaIds) {
  const fieldNotes = Array.isArray(data?.fieldNotes) ? data.fieldNotes.filter(note => note && areaIds.includes(note.area) && typeof note.object==='string')
    .slice(-90).map(note => Object.fromEntries(['area','object','title','text','reference','reading'].map(key => [key,String(note[key] ?? '').slice(0,600)]))) : [];
  const personalNotes = data?.personalNotes && typeof data.personalNotes==='object' && !Array.isArray(data.personalNotes)
    ? Object.fromEntries(Object.entries(data.personalNotes).filter(([key,value])=>key.length<80 && typeof value==='string').slice(0,40).map(([key,value])=>[key,value.slice(0,1200)])) : {};
  return {fieldNotes, personalNotes};
}
