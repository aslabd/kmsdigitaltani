// package yang diperlukan
var jwt = require('jsonwebtoken');
var crypto = = require('crypto');

var connectionPengguna = require('./../../configuration/connectionPengguna');

var UserSchema = require('./../../models/pengguna/user');

var User = connectionPengguna.model('User', UserSchema);

function UserControllers() {
	// Ambil semua user
	this.getAll = function(req, res) {
		let auth = {
			role: 'admin'
		}
		let role = 'admin'

		if (auth == false) {
			res.status(401).json({status: false, message: 'Otentikasi gagal.'})
		} else if(auth.role !== role) {
			res.status(403).json({status: false, message: 'Otorisasi gagal.'}) 
		} else {
			let option = JSON.parse(req.params.option);
			let skip = Number(option.skip);
			let limit = Number(option.limit);
			let status = option.status;

			if (!(skip && limit && status)) {
				res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
			} else {
				User
					.find()
					.where('status').equals(status)
					.select({
						password: -1
					})
					.skip(skip)
					.limit(limit)
					.exec(function(err, user) {
						if (err) {
							res.status(500).json({status: false, message: 'Ambil beberapa user gagal.', err: err});
						} else if (!user || user == 0) {
							res.status(204).json({status: false, message: 'User tidak ditemukan.'});
						} else {
							res.status(200).json({status: true, message: 'Ambil beberapa user berhasil.', data: user});
						}
					})
			}
		}
	}

	// Tambah user
	this.add = function(req, res) {
		let username = req.body.username;
		let password = req.body.password;
		let email = req.body.email;


		if (username && password && email && name) {
			res.status(400).json({status: false, message: 'Ada parameter yang kosong.'});
		} else {
			User
				.find()
				.or([{
					username: username
				}, {
					email: email
				}])
				.exec(function(err, user) {
					if (err) {
						res.status(500).json({})
					} else if(user || user != 0) {
						res.status(400).json({status: false, message: 'Pengguna dengan username atau email tersebut sudah ada. Silahkan login.'});
					} else {	
						password = crypto.createHash('md5').update(password + 'portalharga', 'utf8').digest('hex');
						
						User
							.create({
								username: username,
								password: password,
								email: email,
								nama: nama
							})
							.then(function(user) {
								mail.verify(req, res)
							})
							.catch(function(err) {
								res.status(500).json({status: false, message: 'Tambah user baru gagal.', err: err});
							})
					}
				})
		}
	}

	this.login = function(req, res) {
		let username = req.body.username;
		let password = req.body.password;
		let login_type = req.body.login_type;
		if(login_type==null) {
      		res.status(500).json({ status:500,success: false, message: 'Asal device tidak diketahui'});
  		} else {
      		password = crypto.createHash('md5').update(req.body.password + 'portalharga', 'utf8').digest('hex');
      		// find the user
      		User
      			.findOne({
      				username: username,
      				password: password
      			})
      			function(err, user) {
          if (user==null) 
          {
              res.status(400).json({ status:400,success: false, message: 'Authentication failed. User not found.' });
          } 
          else if(user) 
          {
              // chec if password matches
              if (user.password != generated_hash) 
              {
                  res.status(400).json({ status:400,success: false, message: 'Authentication failed. Wrong password.' });
              } 
              else 
              {
                  var dt = new Date();
                  var utcDate = dt.toGMTString();
                  user.password = generated_hash;
                  user.last_login=utcDate;
                  user.save(function(err)
                  {
                    // for website
                    if(req.body.login_type==0)
                    {
                      var token = jwt.sign({  
                                              _id: user._id,
                                              user_data:user,
                                              user_id:user.user_id,
                                              username:user.username,
                                              time:user.last_login,
                                              role:user.role,
                                              login_type:req.body.login_type
                                            }
                                            ,codeSecret.secret, {
                                            expiresIn : 60*60// expires in 24 hours
                                            });
                      }
                      // for mobile
                      else if(req.body.login_type==1)
                      {
                        var token = jwt.sign({
                                                _id: user._id,
                                                user_id:user.user_id,
                                                username:user.username,
                                                time:user.last_login,
                                                role:user.role,
                                                login_type:req.body.login_type
                                              }
                                              ,codeSecret.secret,{
                                              //no expires
                                              });
                      }
                      setTimeout(function()
                      {
                          User.findOne({username: req.body.username}, '-_id -__v -password',function(err, result)
                          {
                              if (err) 
                              {
                                  return console.log(err);
                              }
                              else 
                              {
                                  mail.getMailVerify(req,res,user.isValidate,user.email,user.username,user.name,user.user_id);
                                  res.json({success: true,status:200,message: 'Login Success',data : result,token: token});    
                              }
                          });        
                      },100);
                  });
               }   
            }
        });
     }
	}
}

module.exports = new KomentarControllers();