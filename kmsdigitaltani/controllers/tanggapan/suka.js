var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');

var connection = require('./../../connection');

var PostSchema = require('./../../models/artikel/post');
var TanyaSchema = require('./../../models/diskusi/tanya');
var TopikSchema = require('./../../models/materi/topik');
var KomentarSchema = require('./../../models/tanggapan/komentar');
var BalasanSchema = require('./../../models/tanggapan/balasan');
var SukaSchema = require('./../../models/tanggapan/suka');

var Post = connection.model('Post', PostSchema);
var Tanya = connection.model('Tanya', TanyaSchema);
var Topik = connection.model('Topik', TopikSchema);
var Komentar = connection.model('Komentar', KomentarSchema);
var Balasan = connection.model('Balasan', BalasanSchema);
var Suka = connection.model('Suka', SukaSchema);

function SukaControllers() {
	this.isSayaSukaPost = function(req, res) {
		let id_post = mongoose.Types.ObjectId(req.params.id_post);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)
		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penyuka = mongoose.Types.ObjectId(decoded._id);

		Post
			.aggregate([{
				$lookup: {
					from: 'sukas',
					localField: 'suka',
					foreignField: '_id',
					as: 'suka'
				}
			}, {
				$match: {
					_id: id_post,
					'suka.penyuka': penyuka
				}
			}])
			.exec(function(err, suka) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil flag saya suka di suatu artikel gagal.', err: err});
				} else if (suka == null || suka == 0) {
					res.status(200).json({status: true, message: 'Ambil flag saya suka di suatu artikel berhasil.', data: false});
				} else {
					res.status(200).json({status: true, message: 'Ambil flag saya suka di suatu artikel berhasil.', data: true});
				}
			});
	}

	this.isSayaSukaTanya = function(req, res) {
		let id_tanya = mongoose.Types.ObjectId(req.params.id_tanya);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)
		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penyuka = mongoose.Types.ObjectId(decoded._id);

		Tanya
			.aggregate([{
				$lookup: {
					from: 'sukas',
					localField: 'suka',
					foreignField: '_id',
					as: 'suka'
				}
			}, {
				$match: {
					_id: id_tanya,
					'suka.penyuka': penyuka
				}
			}])
			.exec(function(err, suka) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil flag saya suka di suatu pertanyaan gagal.', err: err});
				} else if (suka == null || suka == 0) {
					res.status(200).json({status: true, message: 'Ambil flag saya suka di suatu pertanyaan berhasil.', data: false});
				} else {
					res.status(200).json({status: true, message: 'Ambil flag saya suka di suatu pertanyaan berhasil.', data: true})
				}
			});
	}

	this.isSayaSukaTopik = function(req, res) {
		let id_topik = mongoose.Types.ObjectId(req.params.id_topik);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)
		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penyuka = mongoose.Types.ObjectId(decoded._id);

		Topik
			.aggregate([{
				$lookup: {
					from: 'sukas',
					localField: 'suka',
					foreignField: '_id',
					as: 'suka'
				}
			}, {
				$match: {
					_id: id_topik,
					'suka.penyuka': penyuka
				}
			}])
			.exec(function(err, suka) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil flag saya suka di suatu materi gagal.', err: err});
				} else if (suka == null || suka == 0) {
					res.status(200).json({status: true, message: 'Ambil flag saya suka di suatu materi berhasil.', data: false});
				} else {
					res.status(200).json({status: true, message: 'Ambil flag saya suka di suatu materi berhasil.', data: true})
				}
			});
	}

	this.isSayaSukaKomentar = function(req, res) {
		let id_komentar = mongoose.Types.ObjectId(req.params.id_komentar);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)
		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penyuka = mongoose.Types.ObjectId(decoded._id);

		Komentar
			.aggregate([{
				$lookup: {
					from: 'sukas',
					localField: 'suka',
					foreignField: '_id',
					as: 'suka'
				}
			}, {
				$match: {
					_id: id_komentar,
					'suka.penyuka': penyuka
				}
			}])
			.exec(function(err, suka) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil flag saya suka di suatu komentar gagal.', err: err});
				} else if (suka == null || suka == 0) {
					res.status(200).json({status: true, message: 'Ambil flag saya suka di suatu komentar berhasil.', data: false});
				} else {
					res.status(200).json({status: true, message: 'Ambil flag saya suka di suatu komentar berhasil.', data: true})
				}
			});
	}

	this.isSayaSukaBalasan = function(req, res) {
		let id_balasan = mongoose.Types.ObjectId(req.params.id_balasan);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)
		let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
		let penyuka = mongoose.Types.ObjectId(decoded._id);

		Balasan
			.aggregate([{
				$lookup: {
					from: 'sukas',
					localField: 'suka',
					foreignField: '_id',
					as: 'suka'
				}
			}, {
				$match: {
					_id: id_balasan,
					'suka.penyuka': penyuka
				}
			}])
			.exec(function(err, suka) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil flag saya suka di suatu balasan gagal.', err: err});
				} else if (suka == null || suka == 0) {
					res.status(200).json({status: true, message: 'Ambil flag saya suka di suatu balasan berhasil.', data: false});
				} else {
					res.status(200).json({status: true, message: 'Ambil flag saya suka di suatu balasan berhasil.', data: true})
				}
			});
	}

	// fungsi hitung jumlah suka di artikel
	this.countFromPost = function(req, res) {
		let id_post = mongoose.Types.ObjectId(req.params.id_post);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

		Post
			.aggregate([{
				$match: {
					_id: id_post
				}
			}, {
				$unwind: '$suka'	// pecah data untuk setiap suka
			}, {
				$group: {
					_id: '$_id',
					jumlah_suka: {
						$sum: 1
					}
				}
			}])
			.exec(function(err, suka) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil jumlah suka di suatu artikel gagal.', err: err});
				} else {
					res.status(200).json({status: true, message: 'Ambil jumlah suka di suatu artikel berhasil.', data: suka})
				}
			});
	}

	this.countFromTanya = function(req, res) {
		let id_tanya = mongoose.Types.ObjectId(req.params.id_tanya);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

		Tanya
			.aggregate([{
				$match: {
					_id: id_tanya
				}
			}, {
				$unwind: '$suka'	// pecah data untuk setiap suka
			}, {
				$group: {
					_id: '$_id',
					jumlah_suka: {
						$sum: 1
					}
				}
			}])
			.exec(function(err, suka) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil jumlah suka di suatu pertanyaan gagal.', err: err});
				} else {
					res.status(200).json({status: true, message: 'Ambil jumlah suka di suatu pertanyaan berhasil.', data: suka})
				}
			});
	}

	this.countFromTopik = function(req, res) {
		let id_topik = mongoose.Types.ObjectId(req.params.id_topik);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

		Topik
			.aggregate([{
				$match: {
					_id: id_topik
				}
			}, {
				$unwind: '$suka'	// pecah data untuk setiap suka
			}, {
				$group: {
					_id: '$_id',
					jumlah_suka: {
						$sum: 1
					}
				}
			}])
			.exec(function(err, suka) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil jumlah suka di suatu materi gagal.', err: err});
				} else {
					res.status(200).json({status: true, message: 'Ambil jumlah suka di suatu materi berhasil.', data: suka})
				}
			});
	}

	this.countFromKomentar = function(req, res) {
		let id_komentar = mongoose.Types.ObjectId(req.params.id_komentar);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

		Komentar
			.aggregate([{
				$match: {
					_id: id_komentar
				}
			}, {
				$unwind: '$suka'	// pecah data untuk setiap suka
			}, {
				$group: {
					_id: '$_id',
					jumlah_suka: {
						$sum: 1
					}
				}
			}])
			.exec(function(err, suka) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil jumlah suka di suatu komentar gagal.', err: err});
				} else {
					res.status(200).json({status: true, message: 'Ambil jumlah suka di suatu komentar berhasil.', data: suka})
				}
			});
	}

	this.countFromBalasan = function(req, res) {
		let id_balasan = mongoose.Types.ObjectId(req.params.id_balasan);	// casting string jadi ObjectId (khusus untuk fungsi aggregate)

		Balasan
			.aggregate([{
				$match: {
					_id: id_balasan
				}
			}, {
				$unwind: '$suka'	// pecah data untuk setiap suka
			}, {
				$group: {
					_id: '$_id',
					jumlah_suka: {
						$sum: 1
					}
				}
			}])
			.exec(function(err, suka) {
				if (err) {
					res.status(500).json({status: false, message: 'Ambil jumlah suka di suatu balasan gagal.', err: err});
				} else {
					res.status(200).json({status: true, message: 'Ambil jumlah suka di suatu balasan berhasil.', data: suka})
				}
			});
	}

	// fungsi suka/batal suka artikel
	this.ubahToPost = function(req, res) {
		let auth = {
			role: 'admin'
		};
		let role = 'admin'

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			let id = mongoose.Types.ObjectId(req.body.id);
			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penyuka = mongoose.Types.ObjectId(decoded._id);

			if (id == null || penyuka == null) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				Post
					.findById(id)
					.then(function(post) {
						if (post == null || post == 0) {
							res.status(204).json({status: false, message: 'Artikel tidak ditemukan.'});
						} else {
							Post
								.aggregate([{
									$lookup: {
										from: 'sukas',
										localField: 'suka',
										foreignField: '_id',
										as: 'suka'
									}
								}, {
									$match: {
										_id: id,
										'suka.penyuka': penyuka
									}
								}])
								.exec(function(err, disukai) {
									if (err) {
										res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
									} else if (disukai == null || disukai == 0) {
										Suka
											.create({
												penyuka: penyuka
											})
											.then(function(suka) {
												post.suka
													.push(suka._id);

												post
													.save(function(err, post) {
														if (err) {
															res.status(500).json({status: false, message: 'Simpan suka artikel gagal.', err: err});
														} else {
															res.status(200).json({status: true, message: 'Suka artikel berhasil.', data: post});
														}
													})
											})
											.catch(function(err) {
												res.status(500).json({status: false, message: 'Suka artikel gagal.', err: err});
											});
									} else {
										Suka
											.findByIdAndRemove(post.suka[0])
											.then(function(suka) {
												post.suka
													.pull(suka._id)
												
												post
													.save(function(err, post) {
														if (err) {
															res.status(500).json({status: false, message: 'Simpan batal suka artikel gagal.', err: err});
														} else {
															res.status(200).json({status: true, message: 'Batal suka artikel berhasil.', data: post});
														}
													})
											})
											.catch(function(err) {
												res.status(500).json({status: false, message: 'Batal suka artikel gagal.', err: err});
											});
									}
								});
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil artikel gagal.', err: err});
					});
			}
		}
	}

	this.ubahToTanya = function(req, res) {
		let auth = {
			role: 'admin'
		};
		let role = 'admin'

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			let id = mongoose.Types.ObjectId(req.body.id);
			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penyuka = mongoose.Types.ObjectId(decoded._id);

			if (id == null || penyuka == null) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				Tanya
					.findById(id)
					.then(function(tanya) {
						if (tanya == null || tanya == 0) {
							res.status(204).json({status: false, message: 'Pertanyaan tidak ditemukan.'});
						} else {
							Tanya
								.aggregate([{
									$lookup: {
										from: 'sukas',
										localField: 'suka',
										foreignField: '_id',
										as: 'suka'
									}
								}, {
									$match: {
										_id: id,
										'suka.penyuka': penyuka
									}
								}])
								.exec(function(err, disukai) {
									if (err) {
										res.status(500).json({status: false, message: 'Ambil pertanyaan gagal.', err: err});
									} else if (disukai == null || disukai == 0) {
										Suka
											.create({
												penyuka: penyuka
											})
											.then(function(suka) {
												tanya.suka
													.push(suka._id);

												tanya
													.save(function(err, tanya) {
														if (err) {
															res.status(500).json({status: false, message: 'Simpan suka pertanyaan gagal.', err: err});
														} else {
															res.status(200).json({status: true, message: 'Suka pertanyaan berhasil.', data: tanya});
														}
													})
											})
											.catch(function(err) {
												res.status(500).json({status: false, message: 'Suka pertanyaan gagal.', err: err});
											});
									} else {
										Suka
											.findByIdAndRemove(tanya.suka[0])
											.then(function(suka) {
												tanya.suka
													.pull(suka._id)
												
												tanya
													.save(function(err, tanya) {
														if (err) {
															res.status(500).json({status: false, message: 'Simpan batal suka pertanyaan gagal.', err: err});
														} else {
															res.status(200).json({status: true, message: 'Batal suka pertanyaan berhasil.', data: tanya});
														}
													})
											})
											.catch(function(err) {
												res.status(500).json({status: false, message: 'Batal suka pertanyaan gagal.', err: err});
											});
									}
								});
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil pertanyaan gagal.', err: err});
					});
			}
		}
	}

	this.ubahToTopik = function(req, res) {
		let auth = {
			role: 'admin'
		};
		let role = 'admin'

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			let id = mongoose.Types.ObjectId(req.body.id);
			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penyuka = mongoose.Types.ObjectId(decoded._id);

			if (id == null || penyuka == null) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				Topik
					.findById(id)
					.then(function(topik) {
						if (topik == null || topik == 0) {
							res.status(204).json({status: false, message: 'Materi tidak ditemukan.'});
						} else {
							Topik
								.aggregate([{
									$lookup: {
										from: 'sukas',
										localField: 'suka',
										foreignField: '_id',
										as: 'suka'
									}
								}, {
									$match: {
										_id: id,
										'suka.penyuka': penyuka
									}
								}])
								.exec(function(err, disukai) {
									if (err) {
										res.status(500).json({status: false, message: 'Ambil materi gagal.', err: err});
									} else if (disukai == null || disukai == 0) {
										Suka
											.create({
												penyuka: penyuka
											})
											.then(function(suka) {
												topik.suka
													.push(suka._id);

												topik
													.save(function(err, topik) {
														if (err) {
															res.status(500).json({status: false, message: 'Simpan suka materi gagal.', err: err});
														} else {
															res.status(200).json({status: true, message: 'Suka materi berhasil.', data: topik});
														}
													})
											})
											.catch(function(err) {
												res.status(500).json({status: false, message: 'Suka materi gagal.', err: err});
											});
									} else {
										Suka
											.findByIdAndRemove(topik.suka[0])
											.then(function(suka) {
												topik.suka
													.pull(suka._id)
												
												topik
													.save(function(err, topik) {
														if (err) {
															res.status(500).json({status: false, message: 'Simpan batal suka materi gagal.', err: err});
														} else {
															res.status(200).json({status: true, message: 'Batal suka materi berhasil.', data: topik});
														}
													})
											})
											.catch(function(err) {
												res.status(500).json({status: false, message: 'Batal suka materi gagal.', err: err});
											});
									}
								});
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil materi gagal.', err: err});
					});
			}
		}
	}

	this.ubahToKomentar = function(req, res) {
		let auth = {
			role: 'admin'
		};
		let role = 'admin'

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			let id = mongoose.Types.ObjectId(req.body.id);
			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penyuka = mongoose.Types.ObjectId(decoded._id);

			if (id == null || penyuka == null) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				Komentar
					.findById(id)
					.then(function(komentar) {
						if (komentar == null || komentar == 0) {
							res.status(204).json({status: false, message: 'Komentar tidak ditemukan.'});
						} else {
							Komentar
								.aggregate([{
									$lookup: {
										from: 'sukas',
										localField: 'suka',
										foreignField: '_id',
										as: 'suka'
									}
								}, {
									$match: {
										_id: id,
										'suka.penyuka': penyuka
									}
								}])
								.exec(function(err, disukai) {
									if (err) {
										res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
									} else if (disukai == null || disukai == 0) {
										Suka
											.create({
												penyuka: penyuka
											})
											.then(function(suka) {
												komentar.suka
													.push(suka._id);

												komentar
													.save(function(err, komentar) {
														if (err) {
															res.status(500).json({status: false, message: 'Simpan suka komentar gagal.', err: err});
														} else {
															res.status(200).json({status: true, message: 'Suka komentar berhasil.', data: komentar});
														}
													})
											})
											.catch(function(err) {
												res.status(500).json({status: false, message: 'Suka komentar gagal.', err: err});
											});
									} else {
										Suka
											.findByIdAndRemove(komentar.suka[0])
											.then(function(suka) {
												komentar.suka
													.pull(suka._id)
												
												komentar
													.save(function(err, komentar) {
														if (err) {
															res.status(500).json({status: false, message: 'Simpan batal suka komentar gagal.', err: err});
														} else {
															res.status(200).json({status: true, message: 'Batal suka komentar berhasil.', data: komentar});
														}
													})
											})
											.catch(function(err) {
												res.status(500).json({status: false, message: 'Batal suka komentar gagal.', err: err});
											});
									}
								});
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil komentar gagal.', err: err});
					});
			}
		}
	}

	this.ubahToBalasan = function(req, res) {
		let auth = {
			role: 'admin'
		};
		let role = 'admin'

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'});
		} else {
			let id = mongoose.Types.ObjectId(req.body.id);
			let decoded = jwt.decode(req.headers.authorization.split(' ')[1]);
			let penyuka = mongoose.Types.ObjectId(decoded._id);

			if (id == null || penyuka == null) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				Balasan
					.findById(id)
					.then(function(balasan) {
						if (balasan == null || balasan == 0) {
							res.status(204).json({status: false, message: 'Balasan tidak ditemukan.'});
						} else {
							Balasan
								.aggregate([{
									$lookup: {
										from: 'sukas',
										localField: 'suka',
										foreignField: '_id',
										as: 'suka'
									}
								}, {
									$match: {
										_id: id,
										'suka.penyuka': penyuka
									}
								}])
								.exec(function(err, disukai) {
									if (err) {
										res.status(500).json({status: false, message: 'Ambil balasan gagal.', err: err});
									} else if (disukai == null || disukai == 0) {
										Suka
											.create({
												penyuka: penyuka
											})
											.then(function(suka) {
												balasan.suka
													.push(suka._id);

												balasan
													.save(function(err, balasan) {
														if (err) {
															res.status(500).json({status: false, message: 'Simpan suka balasan gagal.', err: err});
														} else {
															res.status(200).json({status: true, message: 'Suka balasan berhasil.', data: balasan});
														}
													})
											})
											.catch(function(err) {
												res.status(500).json({status: false, message: 'Suka balasan gagal.', err: err});
											});
									} else {
										Suka
											.findByIdAndRemove(balasan.suka[0])
											.then(function(suka) {
												balasan.suka
													.pull(suka._id)
												
												balasan
													.save(function(err, balasan) {
														if (err) {
															res.status(500).json({status: false, message: 'Simpan batal suka balasan gagal.', err: err});
														} else {
															res.status(200).json({status: true, message: 'Batal suka balasan berhasil.', data: balasan});
														}
													})
											})
											.catch(function(err) {
												res.status(500).json({status: false, message: 'Batal suka balasan gagal.', err: err});
											});
									}
								});
						}
					})
					.catch(function(err) {
						res.status(500).json({status: false, message: 'Ambil balasan gagal.', err: err});
					});
			}
		}
	}
}

module.exports = new SukaControllers();