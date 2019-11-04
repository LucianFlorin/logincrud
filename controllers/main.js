const Helper = require("../helpers/Helper");

const registerUser = (req, res, db) => {
  const { email, password } = req.body;
  let hashedPassword = Helper.hashPassword(password);
  db('users').insert({username : email, password : hashedPassword, utype : 'guest'})
      .returning('*')
      .then(item => res.json(item))
      .catch(err => res.status(400).json({dbError: 'could not register'}));
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
                res.end();
            }
        }
        else {
            res.send('Incorrect username or password!');
        }
    });
};

const getProjects = (req, res, db) => {
  db.select('projects.pid', 'projects.pname', 'projects.pdescription', 'users.username')
      .from('projects')
      .leftJoin('users', 'users.uid', 'projects.uid')
    .then(items => {
      if(items.length){
        res.json(items)
      } else {
        res.json({dataExists: 'false'})
      }
    })
    .catch(err => res.status(400).json({dbError: 'db error'}))
};

const postProject = (req, res, db) => {
  const { pname, pdescription } = req.body;
  db('projects').insert({ pname, pdescription })
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