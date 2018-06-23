var mongoose = require('mongoose');
var Schema = mongoose.Schema;

module.exports = new Schema({
   	jumlah: {
   		artikel: { type: Number, default: null, min: 0 },
   		diskusi: { type: Number, default: null, min: 0 },
   		materi: { type: Number, default: null, min: 0 },
   	},
   	following: [{
   		user: Schema.Types.ObjectId,
   		tanggal: { type: Date, default: Date.now }
   	}],
   	follower: [{
   		user: Schema.Types.ObjectId,
   		tanggal: { type: Date, default: Date.now }
   	}]
});