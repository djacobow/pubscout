/* jshint esversion:6 */

var fs = require('fs');

var areas = {
    'AE': {
        name: 'Energy Technologies Area',
        overview: '<p>The Energy Technologies Area at Lawrence Berkeley National Lab conducts innovative and imaginative research designed to reduce energy use, save money and rebuild our nation\'s infrastructure. Our applied technologies have saved consumers, utilities, businesses and the government billions of dollars, and we\'ve shared our results and publications worldwide. Looking forward, we are excited to build on this strong foundation to bring about realistic, applied solutions to solve problems within a time frame that delivers results.</p>',
        websites: [
            {
                url: 'https://eta.lbl.gov',
            },
        ],
    },
    'CS': {
        name: 'Computing Sciences',
        overview: '<p>Whether running quadrillions of calculations on a supercomputer or sharing, analyzing and visualizing massive datasets, scientists today rely on advances in computer science, applied mathematics and computational science, as well as high performance computing and networking facilities, to increase our understanding of ourselves, our planet, and our universe. Berkeley Lab\'s Computing Sciences Area researches, develops and deploys new tools and technologies to meet these needs.</p>',
    },
    'ES': {
        name: 'Energy Sciences',
    },
    'AU': {
        name: 'Earth & Environmenetal Sciences',
        overview: '<p>Berkeley Lab’s Earth & Environmental Sciences Area is a premier Earth sciences research organization where scientists are tackling some of the most pressing environmental and energy challenges of the 21st Century in order to enable sustainable stewardship and judicious use of the Earth’s subsurface energy resources. With the breadth of expertise of integrated teams offered by the Climate and Ecosystem Sciences and the Energy Geosciences Divisions, the Area vision is to lead the nation in solving complex environment and energy challenges.</p>',
        icon: './group_images/ees.png',
        websites: [
            {
                url: 'https://eesa.lbl.gov',
            },
        ],
    },
    'BS': {
        name: 'Biosciences',
        overview: '<p>The Biosciences Area forges multidisciplinary teams to solve national challenges in energy, environment, and health issues, as well as advance the engineering of biological systems for sustainable manufacturing.</p><p>Biosciences Area research is coordinated through three Divisions and one User Facility: Biological Systems and Engineering, Environmental Genomics and Systems Biology, Molecular Biophysics and Integrated Bioimaging and the National User Facility DOE Joint Genome Institute.</p><p> Enabled by Berkeley Lab’s world-class user facilities and complementary research programs, our culture of team science and cross-disciplinary research will enable us to contribute groundbreaking discoveries and innovative solutions to complex scientific and societal challenges.</p>',
        icon: './group_images/biosciences.png',
        websites: [
            {
                url: 'http://biosciences.lbl.gov',
            },
        ],
    },
    'PS': {
        name: 'Physical Sciences',
        websites: [
            {
                url: 'http://www.lbl.gov/research-areas/physical-sciences/',
            },
        ],
    },
};


var divisions = {
    'AEEA': {
        name: "Energy Analysis & Environmental Impacts",
        area: 'Energy Technologies Area',
        overview: "<p>The Energy Analysis & Environmental Impacts Division analyzes worldwide energy consumption and related impacts to inform policy, standards, and decision-making for the benefit of society and the environment.</p>",
        websites: [
            {
                url: 'https://eaei.lbl.gov/',
            },
        ],
    },
    "PSAP": {
        name: "Physical Sciences",
        area: "Physical Sciences"
    },
    "BSBS": {
        name: "BioSciences Directorate",
        area: "BioSciences"
    },
    'ESCH': {
        name: "Chemical Sciences",
        area: "Energy Sciences",
        overview: "<p>The Chemical Sciences Division at Lawrence Berkeley National Laboratory is the home of fundamental research in chemistry and chemical engineering. Our work provides a basis for new and improved energy technologies and for understanding and mitigating the environmental impacts of energy use. To fulfill its vision and mission, the Division pioneers an integrated research portfolio in fundamental chemistry that seamlessly spans from atomic scales to macroscopic scales and from time scales of electron motion (attoseconds) to the natural time scales of chemical transformations and catalytic reactions (standard clock time). Theory and experiment are very closely coupled across all research areas, including interfacial chemistry; gas phase and condensed phase chemical physics; homogeneous and heterogeneous catalysis; heavy element chemistry; ultrafast X-ray sciences; and atomic, molecular and optical sciences. This cutting-edge research portfolio is designed to support the Basic Energy Sciences mission of the Department of Energy.</p>",
        icon: './group_images/csd.png',
        websites: [
            {
                url: 'https://commons.lbl.gov/display/csd/Chemical+Sciences+Division+Home',
                label: 'Chemical Sciences Division',
            },
        ],
    },
    'PSAF': {
        name: "Accelerator Technology & Applied Physics",
        area: "Physical Sciences",
        icon: './group_images/atap.png',
        overview: "<p>Supporting DOE’s mission by inventing, developing, and deploying accelerators and photon sources to explore and control matter and energy.</p><p>Exploring the frontiers of accelerator and photon-source science and providing powerful new tools to serve the nation’s needs.</p><p>Training the next generation of students and postdocs.</p><p>Holding ourselves to the highest scientific, safety and diversity standards</p>",
        websites: [
            {
                url: 'http://atap.lbl.gov',
            }
        ],
    },
    'AEED': {
        name: "Energy Storage & Distributed Resources",
        area: "Energy Technologies"
    },
    'AEBU': {
        name: "Building Technology & Urban Systems",
        area: "Energy Technologies",
        overview: "<p>We work closely with industry, government and policy makers to inform and develop building technology and urban systems that increase energy efficiency, save money and improve health and safety for building occupants. We engage in innovative and creative research to advance energy efficiency in the built environment, one of the world's most critical energy and environmental challenges because buildings are the world's largest energy-users.</p>",
        websites: [
            {
                url: 'https://buildings.lbl.gov/',
            },
        ],
    },
    'AUGO': {
        name: "Energy Geosciences",
        area: "Earth & Environmental Sciences",
        icon: './group_images/egs.png',
        overview: "<p>The mission of the Energy Geosciences Division is to create basic and use-inspired knowledge, methods, and capabilities for sustainable utilization and management of the Earth’s subsurface.</p><p>Energy Geosciences Division scientists integrate cutting-edge numerical, observational and experimental approaches in both fundamental and applied research projects.</p>",
        websites: [
            {
                url: 'https://eesa.lbl.gov/our-divisions/energy-geosciences/',
            }
        ],
    },
    'AUCE': {
        name: "Climate & Ecosystem Sciences",
        area: "Earth & Environmental Sciences",
        icon: './group_images/ces.png',
        overview: "<p>Our missions is to develop the foundational knowledge and capabilities needed to understand, predict, and advance stewardship of Earth’s Climate and Ecosystems.</p>",
        websites: [
            {
                url: 'https://eesa.lbl.gov/departments/climate-sciences/',
            },
        ],

    },
    'PSPH': {
        name: "Physics",
        area: "Physical Sciences",
        icon: './group_images/physics.png',
        overview: "<p>In the 21st century, particle physics and cosmology have come together in a unified quest to understand the fundamental constituents of the Universe and how they evolved after the Big Bang. A radically new picture has emerged in the past two decades, in which the energy content of the Universe today consists of only 4% ordinary matter, with the rest divided among two mysterious components, dark matter and dark energy. The LBNL Physics Division carries out research that spans the full range of particle physics and cosmology, from studies of sub-atomic particles created in accelerator collisions that decay almost instantly, to large-scale cosmological structures observed in galaxy surveys looking back billions of years in cosmic time.</p>",
        websites: [
            {
                url: 'https://commons.lbl.gov/display/physics/Physics+Division+Home',
            },
        ],
    },
    'BSMB': {
        name: "Molecular Biophysics & Integrated BioImaging",
        area: "BioSciences",
        icon: './group_images/mbib.png',
        overview: "<p>The mission of the Molecular Biophysics & Integrated Bioimaging Division is to generate a mechanistic and predictive understanding of biological processes by developing and applying molecular- and meso-scale visualization and advanced spectroscopies, enabling the control, manipulation and generation of biological function.</p>",
        websites: [
            {
                url: 'http://biosciences.lbl.gov/divisions/mbib/',
            }
        ],
    },
    'ESMS': {
        name: "Materials Sciences",
        area: "Energy Sciences",
        icon: './group_images/msd.png',
        overview: "<p>At Berkeley Lab’s Materials Sciences Division, we advance the fundamental science of materials within the context of global energy-related challenges. We develop experimental and theoretical techniques to design, discover, and understand new materials and phenomena at multiple time and length scales. Through our core programs and research centers, we cultivate a collaborative and interdisciplinary approach to materials research and help train the next generation of materials scientists.</p>",
        websites: [
            {
                url: 'http://www2.lbl.gov/msd/about/index.html',
            },
        ]

    },
    'PSNS': {
        name: "Nuclear Science",
        area: "Physical Sciences",
        icon: './group_images/nsd.png',
        overview: "<p>The Nuclear Science Division conducts basic research aimed at understanding the structure and interactions of nuclei and the forces of nature as manifested in nuclear matter – topics that align the Division with the national program as elucidated in the 2007 U.S. Nuclear Science Long Range Plan.</p>",
        websites: [
            {
                url: 'https://commons.lbl.gov/display/nsd/Home',
            },
        ],
    },
    'CSCR': {
        name: "Computational Research",
        area: "Computing Sciences",
        icon: './group_images/crd.png',
        overview: "<p>The Computational Research Division conducts research and development in mathematical modeling and simulation, algorithm design, data storage, management and analysis, computer system architecture and high-performance software implementation. We collaborate directly with scientists across Berkeley Lab, the Department of Energy and industry to solve some of the world’s most challenging computational and data management and analysis problems in a broad range of scientific and engineering fields.</p>",
        websites: [
            {
                url: 'http://crd.lbl.gov',
            },
        ],
    },
    'BSBE': {
        name: "Biological Systems & Engineering",
        area: "BioSciences",
        overview: "<p>The Biological Systems and Engineering Division mission is to advance a mechanistic and predictive understanding of complex biological systems over multiple scales in terms of their responses to manipulation, stress, disease and environmental challenges. We will translate this knowledge using engineering principles to develop resilient systems, tools, and processes for the efficient production of fuels, chemicals, materials, tissues, and therapeutics.</p>",
        icon: './group_images/bse.png',
        websites: [
            {
                url: 'http://biosciences.lbl.gov/divisions/bse/',
            },
        ],
    },
    'PSEG': {
        name: "Engineering",
        area: "Physical Sciences",
        overview: "<p>The Berkeley Lab’s Engineering Division is organized into four different departments: Electronics, Software & Instrumentation Engineering, Magnetics Engineering, Mechanical Engineering, and Project Controls Engineering. Additionally, operations and cross-functional support is managed out of the Engineering Division Directorate. Within the departments, we have a multidisciplinary workforce with a depth and breadth of knowledge that exceeds the norm.</p>",
        websites: [
            {
                url: 'http://engineering.lbl.gov/',
            },
        ],
    },
    'OPOP': {
        name: "Operations",
        area: "Operations",
    },
    'BSEB': {
        name: "Environmental Genomics & Systems Biology",
        area: "BioSciences",
        icon: './group_images/egsb.png',
        overview: "<p>The Environmental Genomics and Systems Biology Division mission is to link genome biology to ecosystem dynamics. We develop systems-level models using integrated molecular observation and controlled manipulation of model organisms and defined biomes to design and test interventions that promote beneficial outcomes.</p>",
        websites: [
            {
                url: 'http://biosciences.lbl.gov/divisions/egsb/',
            },
        ],
    },
    'BSJG': {
        name: "Joint Genome Institute",
        area: "BioSciences",
        icon: './group_images/jgi.png',
        overview: "<p>The mission of the U.S. Department of Energy Joint Genome Institute (DOE JGI), a DOE Office of Science User Facility operated by Lawrence Berkeley National Laboratory (Berkeley Lab) and part of the Biosciences Area, is to advance genomics in support of the DOE missions related to clean energy generation and environmental characterization and cleanup. Supported by the DOE Office of Science, the DOE JGI unites the expertise at Berkeley Lab, Lawrence Livermore National Laboratory, and the HudsonAlpha Institute for Biotechnology. Located in Walnut Creek, California, the DOE JGI is operated by the University of California for the U.S. Department of Energy and the facility provides integrated high-throughput sequencing, DNA design and synthesis, metabolomics and computational analysis that enable systems-based scientific approaches to these challenges.</p>",
        websites: [
            {
                url: 'https://jgi.doe.gov/',
            }
        ],

    },
    'CSNE': {
        name: "National Energy Research Supercomputing Center (NERSC)",
        area: "Computing Sciences",
        icon: './group_images/nersc.png',
        overview: "<p>The National Energy Research Scientific Computing Center (NERSC) is the primary scientific computing facility for the Office of Science in the U.S. Department of Energy. As one of the largest facilities in the world devoted to providing computational resources and expertise for basic scientific research, NERSC is a world leader in accelerating scientific discovery through computation.</p>",
        websites: [
            {
                url: 'http://www.nersc.gov',
            },
        ],

    },
    'ESAE': {
        name: "Energy Sciences",
        area: "Energy Sciences"
    },
    'AUAU': {
        name: "Earth & Environmental Sciences",
        area: "Earth & Environmental Sciences"
    },
    'OPIC': {
        name: "Information Technology",
        area: "Operations"
    },
    'CSAC': {
        name: "Computing",
        area: "Computing Sciences"
    },
    'CSSN': {
        name: "Scientific Networking (ESNet)",
        area: "Computing Sciences",
        overview: "<p>ESnet provides the high-bandwidth, reliable connections that link scientists at national laboratories, universities and other research institutions, enabling them to collaborate on some of the world's most important scientific challenges including energy, climate science, and the origins of the universe. A DOE Office of Science User Facility, ESnet provides scientists with access to unique DOE research facilities and computing resources.</p>",
        icon: './group_images/esnet.png',
        websites: [
            {
                url: 'https://es.net',
            }
        ],
    },
    'ESMF': {
        name: "Molecular Foundry",
        area: "Energy Sciences",
        icon: './group_images/mf.png',
        overview: "<p>The Molecular Foundry is a Department of Energy-funded nanoscience research facility that provides users from around the world with access to cutting-edge expertise and instrumentation in a collaborative, multidisciplinary environment.</p>",
        websites: [
            {
                url: 'http://foundry.lbl.gov/',
            },
        ],
    },
    'AECY': {
        name: "Cyclotron Road",
        area: "Energy Technologies"
    },
    'ESAL': {
        name: 'Advanced Light Source',
        area: 'Energy Sciences',
        icon: './group_images/als.png',
        overview: "<p>The Advanced Light Source (ALS) is a specialized particle accelerator that generates bright beams of x-ray light for scientific research. Electron bunches travel at nearly the speed of light in a circular path, emitting ultraviolet and x-ray light in the process. The light is directed through about 40 beamlines to numerous experimental endstations, where scientists from around the world (“users”) can conduct research in a wide variety of fields, including materials science, biology, chemistry, physics, and the environmental sciences.</p>",
        websites: [
            {
                url: 'https://als.lbl.gov',
            },
        ],
    },
};



var elaborate_icon = function(group) {
    var fn = group.icon;
    if (!fn) fn = './group_images/lbl.png';
    var mimetype = 'image/png';
    var m = fn.match(/.*\.(\w+)$/);
    if (m) {
        var suffix = m[1].toLowerCase();
        switch (suffix) {
            case 'png':  mimetype = 'image/png'; break;
            case 'jpg':  mimetype = 'image/jpeg'; break;
            case 'jpeg': mimetype = 'image/jpeg'; break;
            default: break;
        }
    }
    group.photo_type = mimetype;
    console.log(fn);
    var phdata = fs.readFileSync(fn);
    var encoded = phdata.toString('base64');
    group.photo_data = encoded;
    delete group.icon;
};


var elaborate_category = function(cat) {
    Object.keys(cat).forEach((name) => {
        var group = cat[name];
        group.code = name;
        elaborate_icon(group);
    });
};

var addDivisionsToAreas = function(areas,divisions) {
    Object.keys(divisions).forEach((divcode) => {
        var area_code = divcode.substring(0,2);
        if (areas[area_code]) {
            if (!areas[area_code].divisions) areas[area_code].divisions = {};
            areas[area_code].divisions[divcode] = divisions[divcode].name;
        }
    });
};


if (require.main === module) {
    elaborate_category(divisions);
    elaborate_category(areas);
    addDivisionsToAreas(areas,divisions);
    fs.writeFileSync('./db/staging/division_info.json',JSON.stringify(divisions,null,2));
    fs.writeFileSync('./db/staging/area_info.json',JSON.stringify(areas,null,2));
}



