import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const Project = Schema({
  namaProyek: {
    type: String,
    unique: true,
    required: true,
    dropDups: true
  },
  bidang: String,
  lokasi: String,
  namaPemberiTugas: String,
  alamatPemberiTugas: String,
  tanggalKontrak: String,
  nomorKontrak: String,
  nilaiKontrak: String,
  jv: Number,
  jvWith: String,
  tanggalBast: String,
  nomorBast: String
}, { 
  timestamps: true 
});

export default mongoose.model("Project", Project);