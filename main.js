var csv = require('csv');

var request = require('request');

var sys = require('sys')
var exec = require('child_process').exec;

var moment = require("moment");

var PROJECTS = [
    'birt',
    'datatools',
    'ecd.cft',
    'ecd.che',
    'ecd.dirigible',
    'ecd.flux',
    'ecd.orion',
    'ecd.sprotty',
    'ecd.theia',
    'eclipse.e4',
    'eclipse.equinox',
    'eclipse.jdt',
    'eclipse.jdt.ls',
    'eclipse.pde',
    'eclipse.platform',
    'ee4j',
    'ee4j.ca',
    'ee4j.cu',
    'ee4j.eclipselink',
    'ee4j.ejb',
    'ee4j.el',
    'ee4j.es',
    'ee4j.glassfish',
    'ee4j.grizzly',
    'ee4j.interceptors',
    'ee4j.jacc',
    'ee4j.jakartaee-stable',
    'ee4j.jakartaee-tck',
    'ee4j.jaspic',
    'ee4j.jaxrs',
    'ee4j.jca',
    'ee4j.jersey',
    'ee4j.jms',
    'ee4j.jpa',
    'ee4j.jsonb',
    'ee4j.jsonp',
    'ee4j.jsp',
    'ee4j.jstl',
    'ee4j.jta',
    'ee4j.mojarra',
    'ee4j.openmq',
    'ee4j.servlet',
    'ee4j.soteria',
    'ee4j.tyrus',
    'ee4j.websocket',
    'ee4j.yasson',
    'iot.4diac',
    'iot.agail',
    'iot.californium',
    'iot.concierge',
    'iot.cyclonedds',
    'iot.ditto',
    'iot.duttile',
    'iot.eclipsescada',
    'iot.edje',
    'iot.fog05',
    'iot.hawkbit',
    'iot.hip',
    'iot.hono',
    'iot.ignite',
    'iot.iofog',
    'iot.kapua',
    'iot.keti',
    'iot.kuksa',
    'iot.kura',
    'iot.leshan',
    'iot.milo',
    'iot.mita',
    'iot.mosquitto',
    'iot.om2m',
    'iot.paho',
    'iot.paho.incubator',
    'iot.ponte',
    'iot.risev2g',
    'iot.smarthome',
    'iot.tahu',
    'iot.thingweb',
    'iot.tinydtls',
    'iot.unide',
    'iot.vorto',
    'iot.wakaama',
    'iot.whiskers',
    'locationtech.geobench',
    'locationtech.geogig',
    'locationtech.geomesa',
    'locationtech.geoperil',
    'locationtech.geotrellis',
    'locationtech.geowave',
    'locationtech.jts',
    'locationtech.proj4j',
    'locationtech.rasterframes',
    'locationtech.rasterprocessingengine',
    'locationtech.sfcurve',
    'locationtech.spatial4j',
    'locationtech.udig',
    'modeling.acceleo',
    'modeling.amalgam',
    'modeling.amp',
    'modeling.capra',
    'modeling.eatop',
    'modeling.ecoretools',
    'modeling.ecp',
    'modeling.edapt',
    'modeling.eef',
    'modeling.efm',
    'modeling.elk',
    'modeling.emf-parsley',
    'modeling.emf.cdo',
    'modeling.emf.diffmerge',
    'modeling.emf.egf',
    'modeling.emf.emf',
    'modeling.emf.mwe',
    'modeling.emf.teneo',
    'modeling.emfcompare',
    'modeling.emfservices',
    'modeling.emfstore',
    'modeling.emft.emf-facet',
    'modeling.emft.emfatic',
    'modeling.emft.henshin',
    'modeling.emft.refactor',
    'modeling.emft.texo',
    'modeling.epsilon',
    'modeling.fmc',
    'modeling.gemoc',
    'modeling.gendoc',
    'modeling.gmf-notation',
    'modeling.gmf-runtime',
    'modeling.gmp.gmf-tooling',
    'modeling.graphiti',
    'modeling.m2t.jet',
    'modeling.m2t.xpand',
    'modeling.mdht',
    'modeling.mdt.bpmn2',
    'modeling.mdt.etrice',
    'modeling.mdt.modisco',
    'modeling.mdt.ocl',
    'modeling.mdt.papyrus',
    'modeling.mdt.rmf',
    'modeling.mdt.uml2',
    'modeling.mdt.xsd',
    'modeling.mmt.atl',
    'modeling.mmt.qvt-oml',
    'modeling.mmt.qvtd',
    'modeling.papyrus-rt',
    'modeling.papyrus-xtuml',
    'modeling.pmf',
    'modeling.sirius',
    'modeling.sphinx',
    'modeling.tmf.xtext',
    'modeling.umlgen',
    'modeling.upr',
    'modeling.viatra',
    'modeling.xpect',
    'modeling.xsemantics',
    'mylyn',
    'mylyn.builds',
    'mylyn.commons',
    'mylyn.context',
    'mylyn.context.mft',
    'mylyn.docs',
    'mylyn.docs.intent',
    'mylyn.docs.vex',
    'mylyn.incubator',
    'mylyn.reviews',
    'mylyn.reviews.r4e',
    'mylyn.tasks',
    'mylyn.versions',
    'polarsys.polarsys.3p',
    'polarsys.polarsys.arcon',
    'polarsys.polarsys.b612',
    'polarsys.polarsys.capella',
    'polarsys.polarsys.chess',
    'polarsys.polarsys.cotsaq',
    'polarsys.polarsys.eplmp',
    'polarsys.polarsys.esf',
    'polarsys.polarsys.kitalpha',
    'polarsys.polarsys.libims',
    'polarsys.polarsys.ng661designer',
    'polarsys.polarsys.opencert',
    'polarsys.polarsys.pop',
    'polarsys.polarsys.reqcycle',
    'polarsys.polarsys.rover',
    'polarsys.polarsys.time4sys',
    'rt.apricot',
    'rt.ebr',
    'rt.ecf',
    'rt.gemini.blueprint',
    'rt.gemini.dbaccess',
    'rt.gemini.jpa',
    'rt.gemini.management',
    'rt.gemini.naming',
    'rt.gemini.web',
    'rt.gyrex',
    'rt.jetty',
    'rt.rap',
    'rt.rap.incubator',
    'rt.riena',
    'rt.smila',
    'rt.vertx',
    'rt.virgo',
    'science.chemclipse',
    'science.dawnsci',
    'science.eavp',
    'science.ice',
    'science.january',
    'science.richbeans',
    'science.scanning',
    'science.statet',
    'science.texlipse',
    'science.triquetrum',
    'science.xacc',
    'soa.bpel',
    'soa.bpmn2-modeler',
    'soa.jwt',
    'soa.mangrove',
    'soa.winery',
    'technology.actf',
    'technology.apogy',
    'technology.app4mc',
    'technology.babel',
    'technology.basyx',
    'technology.camf',
    'technology.cbi',
    'technology.ceylon',
    'technology.cognicrypt',
    'technology.collections',
    'technology.dash',
    'technology.dash.dashboard',
    'technology.dltk',
    'technology.ease',
    'technology.eclemma',
    'technology.efxclipse',
    'technology.egerrit',
    'technology.egit',
    'technology.elogbook',
    'technology.epf',
    'technology.gef3d',
    'technology.golo',
    'technology.handly',
    'technology.hudson',
    'technology.iottestware',
    'technology.jgit',
    'technology.jnosql',
    'technology.jubula',
    'technology.lsp4e',
    'technology.lsp4j',
    'technology.lyo',
    'technology.m2e',
    'technology.m2e.m2e-wtp',
    'technology.mdmbl',
    'technology.microprofile',
    'technology.n4js',
    'technology.nebula',
    'technology.nebula.nattable',
    'technology.ogee',
    'technology.omr',
    'technology.openj9',
    'technology.openk-platform',
    'technology.openk-usermodules',
    'technology.osbp',
    'technology.osee',
    'technology.package-drone',
    'technology.packaging',
    'technology.packaging.mpc',
    'technology.packaging.rtp',
    'technology.rcptt',
    'technology.rdf4j',
    'technology.recommenders',
    'technology.recommenders.incubator',
    'technology.reddeer',
    'technology.remus',
    'technology.rtsc',
    'technology.sapphire',
    'technology.scout',
    'technology.sensinact',
    'technology.simopenpass',
    'technology.sisu',
    'technology.skalli',
    'technology.stem',
    'technology.sumo',
    'technology.sw360',
    'technology.sw360.antenna',
    'technology.swtbot',
    'technology.systemfocus',
    'technology.tea',
    'technology.tigerstripe',
    'technology.tm4e',
    'technology.tycho',
    'technology.uomo',
    'technology.usssdk',
    'technology.xwt',
    'tools.acute',
    'tools.ajdt',
    'tools.andmore',
    'tools.aspectj',
    'tools.atf',
    'tools.buckminster',
    'tools.buildship',
    'tools.cdt',
    'tools.cdt.tcf',
    'tools.corrosion',
    'tools.damos',
    'tools.gef',
    'tools.ldt',
    'tools.linuxtools',
    'tools.mat',
    'tools.mtj',
    'tools.objectteams',
    'tools.oomph',
    'tools.orbit',
    'tools.pdt',
    'tools.ptp',
    'tools.ptp.photran',
    'tools.thym',
    'tools.titan',
    'tools.tm',
    'tools.tracecompass',
    'tools.tracecompass.incubator',
    'tools.windowbuilder',
    'webtools.common',
    'webtools.dali',
    'webtools.incubator',
    'webtools.jeetools',
    'webtools.jsdt',
    'webtools.jsf',
    'webtools.libra',
    'webtools.releng',
    'webtools.servertools',
    'webtools.sourceediting',
    'webtools.webservices'
]

var DATES = []

var m = moment("2018-06-30");
var beginningOfCurrentMonth = moment().startOf('month')

while (m.isBefore(beginningOfCurrentMonth)) {
    DATES.push(m.format('YYYY-MM-DD'));
    m.add(1, 'month').endOf('month');
}

// console.log(DATES);

function computeRepositories() {
    var repositories = {};
    var idx = 0;

    for (var i in PROJECTS) {
        var p = PROJECTS[i];
        repositories[p] = []

        console.log('Requesting info for ' + p);

        url = ''
        if  (p.startsWith('polarsys')) {
            url = 'https://polarsys.org/json/project/' + p.replace('polarsys.', '');
        } else if (p.startsWith('locationtech')) {
            url = 'https://locationtech.org/json/project/' + p.replace('locationtech.', 'technology.');
        } else { 
           url = 'https://projects.eclipse.org/json/project/' + p
        }

        request({
            url: url,
            json: true
        }, function(error, response, result) {
            if (!error && response.statusCode == 200) {
                for (var project in result.projects) {
                    var source_repos = result.projects[project].source_repo

                    for (var i in source_repos) {
                        var url = source_repos[i].url;
                        url = url.replace('http://git.eclipse.org/c/', 'http://git.eclipse.org/gitroot/')

                        var path = '/tmp/repos/' + idx++;

                        console.log('$ git clone ' + url + ' ' + path);
                        exec('git clone ' + url + ' ' + path, gitclone_callback(project, url, path));
                    }

                }
            }
        });

    }
}


function gitclone_callback(project, url, path) {
    return function() {
        console.log('[' + project + '] Clone of ' + url + ' in ' + path + ' ... done');

        cloc(project, path, DATES, 0);
    }
}

function cloc(project, path, dates, index) {
    if (index >= dates.length) return;
    var date = dates[index];
    var branch = 'master';
    if (project == 'iot.kura')
        branch = 'develop';

    console.log('GIT_DIR=' + path + '/.git git rev-list ' + branch + ' -n 1 --first-parent --before=' + date)
    exec('GIT_DIR=' + path + '/.git git rev-list ' + branch + ' -n 1 --first-parent --before=' + date, function(error, stdout, stderr) {
        console.log(path + ' - ' + date + ': ' + stdout);

        if (stdout) {
            console.log('$ git --git-dir=' + path + '/.git --work-tree=' + path + ' checkout ' + stdout);
            exec('git --git-dir=' + path + '/.git --work-tree=' + path + ' checkout ' + stdout, function(error, stdout, stderr) {
                if (!error) {
                    var csv_filepath = path + '/../' + project + path.replace('/tmp/repos/', ',') + ',' + date + '.csv';
                    console.log('$ cloc ' + path + ' --csv --report-file=' + csv_filepath);
                    exec('cloc ' + path + ' --csv --report-file=' + csv_filepath, function(error, stdout, stderr) {
                        if (!error) {
                            cloc(project, path, dates, index + 1);
                        } else {
                            console.log(error);
                        }
                    });
                }
            });
        } else {
            cloc(project, path, dates, index + 1);
        }
    });
}

computeRepositories();
