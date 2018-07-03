var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
   	jumlah: {
   		artikel: { type: Number, default: null },
   		diskusi: { type: Number, default: null },
   		materi: { type: Number, default: null },
   	},
      pemilik: { type: Schema.Types.ObjectId, required: true },
   	following: [{
   		user: { type: Schema.Types.ObjectId, required: true },
   		tanggal: { type: Date, default: Date.now }
   	}],
   	follower: [{
   		user: { type: Schema.Types.ObjectId, required: true },
   		tanggal: { type: Date, default: Date.now }
   	}]
});