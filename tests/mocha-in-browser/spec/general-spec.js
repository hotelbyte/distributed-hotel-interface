// implement chai's should interface
var expect = chai.expect;

describe('General', function () {
    describe('window.prompt()', function () {
        it('should not throw errors', function () {
            expect(window.prompt).to.not.throw(Error);
        });
    });

    describe('dhi', function () {
        it('shouldn\'t expose dirname', function () {
            expect(dhi.dirname).to.be.undefined;
        });

        it('shouldn\'t expose shell', function () {
            expect(dhi.shell).to.be.undefined;
        });

        it('should contain only allowed attributes', function () {
            var allowedAttributes = [
                'callbacks',
                'version',
                'license',
                'platform',
                'requestAccount',
                'sounds',
                'menu',
                'solidity'
            ];

            expect(dhi).to.have.all.keys(allowedAttributes);
        });

        it('should return platform', function () {
            expect(dhi.platform).to.be.oneOf(['darwin', 'win32', 'freebsd', 'linux', 'sunos']);
        });

        it('should report solidity version', function () {
            expect(dhi.solidity.version).to.match(/^\d\.\d{1,2}\.\d{1,2}$/); // match examples: 0.4.6, 0.5.10, 0.10.0
        });
    });

    describe('dhi.menu', function () {
        before(function () {
            dhi.menu.clear();
        });

        afterEach(function () {
            dhi.menu.clear();
        });

        it('add() should return false when params are incorrect', function () {
            expect(dhi.menu.add()).to.be.false;
            expect(dhi.menu.add('mydappmenu')).to.be.false;
            expect(dhi.menu.add('mydappmenu', {})).to.be.false;
        });

        it('add() should return true when successful', function () {
            expect(dhi.menu.add('mydappmenu', { name: 'MyMenu' })).to.be.true;
            expect(dhi.menu.add('mydappmenu', { name: 'MyMenu', position: 1 }, function () {})).to.be.true;
        });

        it('add() should update menu entries', function () {
            dhi.menu.add('menu0', { name: 'Test1', selected: true, position: 1 });

            dhi.menu.update('menu0', { name: 'Test1234', selected: false, position: 12 });

            expect(dhi.menu.entries.entry_menu0).to.eql({ id: 'entry_menu0', position: 12, name: 'Test1234', selected: false, badge: undefined });
        });

        it('should be selectable', function () {
            dhi.menu.add('menu0', { name: 'Test1', selected: true });
            dhi.menu.add('menu1', { name: 'Test2' });

            dhi.menu.select('menu1');

            expect(dhi.menu.entries.entry_menu0.selected).to.be.false;
            expect(dhi.menu.entries.entry_menu1.selected).to.be.true;
        });

        it('remove() should remove menu from entries', function () {
            dhi.menu.add('menu0', { name: 'Test2' });
            dhi.menu.add('menu1', { name: 'Test3' });
            dhi.menu.add('menu2', { name: 'Test4' });

            expect(dhi.menu.entries).to.have.all.keys('entry_menu0', 'entry_menu1', 'entry_menu2');
            dhi.menu.remove('menu1');
            expect(dhi.menu.entries).to.have.all.keys('entry_menu0', 'entry_menu2');
        });

        it('clear() should clear menu entries', function () {
            dhi.menu.add('menu0', { name: 'Test1' });
            dhi.menu.add('menu1', { name: 'Test2' });

            expect(dhi.menu.entries).to.have.all.keys('entry_menu0', 'entry_menu1');

            dhi.menu.clear();
            expect(dhi.menu.entries).to.be.empty;
        });

        it('add() should be limited to 100 entries', function () {
            var i;
            // adding 100 entries
            for (i = 0; i < 100; i += 1) {
                dhi.menu.add('menu' + i, { name: 'Test' + i });
            }
            expect(Object.keys(dhi.menu.entries).length).to.equals(100);
            expect(dhi.menu.add('menu 101', {
                name: 'Menu overflow',
            })).to.be.false;
        });
    });
});
