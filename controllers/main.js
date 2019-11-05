const Helper = require("../helpers/Helper");

const registerUser = (req, res, db) => {
  const { username, password, userType } = req.body;
  if(username && password) {
      let hashedPassword = Helper.hashPassword(password);
      db('users').insert({username : username, password : hashedPassword, utype : userType})
          .returning('*')
          .then(item => {
              req.session.loggedIn = true;
              req.session.uid = item[0].uid;
              req.session.utype = item[0].utype;
              req.session.save();
              res.status(200).send('Registration successful!')
          })
          .catch(err => res.status(400).json({dbError: 'could not register'}));
  }
  else {
      res.status(500).send('Invalid username or password');
  }

};

const logInUser = (req, res, db) => {
    const {username, password} = req.body;
    db('users').select('uid', 'utype', 'password').where({
        username
    }).then(items => {
        if(items.length){
            if (Helper.comparePassword(items[0].password, password)) {
                req.session.loggedIn = true;
                req.session.uid = items[0].uid;
                req.session.utype = items[0].utype;
                req.session.save();
                res.status(200).send('Login successful!');
            }
        }
        else {
            res.status(500).send('Incorrect username or password!');
        }
    });
};

const getProjects = (req, res, db) => {
  if(req.session.loggedIn && req.session.uid && req.session.utype) {
      if (req.session.utype === 'admin') {
          db.select('projects.pid', 'projects.pname', 'projects.pdescription', 'users.username')
              .from('projects')
              .leftJoin('users', 'users.uid', 'projects.uid')
              .then(items => {
                  if (items.length) {
                      res.json(items)
                  } else {
                      res.json({dataEmpty: 'true'})
                  }
              })
              .catch(err => res.status(400).json({dbError: 'db error'}))
      }
      else {
          db.select('projects.pid', 'projects.pname', 'projects.pdescription', 'users.username')
              .from('projects')
              .leftJoin('users', 'users.uid', 'projects.uid')
              .where('projects.uid', req.session.uid)
              .then(items => {
                  if (items.length) {
                      res.json(items)
                  } else {
                      res.json({dataEmpty: 'true'})
                  }
              })
              .catch(err => res.status(400).json({dbError: 'db error'}))
      }

  }
  else {
      res.status(400).send('Access denied');
  }

};

const postProject = (req, res, db) => {
  const { pname, pdescription } = req.body;
  const uid = req.session.uid;
  db('projects').insert({ pname, pdescription, uid })
    .returning('*')
    .then(item => {
      res.json(item)
    })
    .catch(err => res.status(400).json({dbError: 'db error'}))
};

const putProject = (req, res, db) => {
    const { pname, pdescription, pid } = req.body;
    db('projects').where({pid}).update({pname, pdescription})
    .returning('*')
    .then(item => {
      res.json(item)
    })
    .catch(err => res.status(400).json({dbError: 'db error'}))
};

const deleteProject = (req, res, db) => {
  const { id } = req.body;
  db('testtable1').where({id}).del()
    .then(() => {
      res.json({delete: 'true'})
    })
    .catch(err => res.status(400).json({dbError: 'db error'}))
};

module.exports = {
  getProjects,
  postProject,
  putProject,
  deleteProject,
  registerUser,
  logInUser
};