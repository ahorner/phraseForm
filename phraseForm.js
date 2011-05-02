function PhraseForm(inputForm) {
  
  var self = this;
  
  self.form = $('<form></form>');
  
  self.inputs = {};
  self.contexts = {};
  self.groups = {};
  self.inUse = {};
  
  self.make = {
    
    clear : function() {
      self.inputs = {};
      self.contexts = {};
      self.groups = {};
      self.inUse = {};
    },
    
    from : function(inputForm) {
      
      self.make.clear();
      self.form = inputForm;
      
      $('input', inputForm).each(function(){
        var input = $(this);
        
        self.inputs[input.attr('id')] = input;
        self.inUse[input.attr('id')] = false;
        
        input.detach();
      });
      
      inputForm.append('<span id="myQuery"></span>');
      
      return self.form;
    },
    
    new : function(params) {
      
      var options = $.extend({
        action : '#',
        method : 'POST',
        id : 'myPhraseForm'
      }, params);
      
      self.make.clear();
      self.form = $('<form></form>')
        .attr('action', options.action)
        .attr('method', options.method)
        .attr('id', options.id)
        .append($('<span id="myQuery"></span>'));
        
      return self.form;
    }
    
  };
  
  
  self.build = {
    
    input : function(params) {
      var options = $.extend({
        type : 'text'
      }, params);
      
      self.inputs[options.id] = $('<input />')
        .attr('type', options.type)
        .attr('id', options.id);
        
    },
    
    inputs : function(paramList) {
      
      $.each(paramList, function(index) {
        self.build.input(paramList[index]);
      });
      
    },
    
    context : function(inputId, context) {
      
      self.contexts[inputId] = context;
      
    },
    
    contexts : function(contextList) {
      
      self.contexts = $.extend(self.contexts, contextList);
      
    },
    
    group : function(groupName, inputs) {
      
      self.groups[groupName] = inputs;
      
    },
    
    groups : function(groupList) {
      
      self.groups = $.extend(self.groups, groupList);
      
    }
    
  };
  
  self.act = {
    
    onGroup : function(group, action) {
      
      $.each(group, function(index) {
        var inputId = group[index];
        action(inputId);
      });
      
    },
    
    delegate : function(item, action) {
      
      var group = self.groups[item];

      if (group == null)
        action(item);
      else
        self.act.onGroup(group, action);
        
    },
    
    query : function(forItem) {
      
      var query = queryItem ? $('#myQuery .contextFor.' + forItem) : $('#myQuery');
      var question = query.html();

      query.find('span').each(function(){
        question = question.replace($(this).attr('outerHTML'), $(this).html());
      });

      query.find('input').each(function(){
        question = question.replace($(this).attr('outerHTML'), $(this).val());
      });

      return question;
      
    },
    
    get : function(getItem) {

      if (self.inUse[getItem])
        return $('#myQuery .contextFor.' + getItem, self.form);

      var query = self.contexts[getItem];
      
      if (query == null) {
        
        query = $("<span></span>")
          .addClass('contextFor')
          .addClass(getItem);
        
        var buildAction = function(inputId) {
          query.append(self.act.get(inputId));
        };
        
        self.act.delegate(getItem, buildAction);
        
      }
      else {
        
        var buildAction = function(inputId) {
          query = query.replace(/\%input/, '<span class="for ' + inputId + '"></span>');
        };

        var appendAction = function(inputId) {
          query.find('span.for.' + inputId).append(self.inputs[inputId]);
        };

        self.act.delegate(getItem, buildAction);
        
        query = $("<span>" + query + " </span>")
          .addClass('contextFor')
          .addClass(getItem);
          
        self.act.delegate(getItem, appendAction);
        
      }

      return query;

    },
    
    add : function(addItem) {
      
      if (self.inUse[addItem]) return;

      $('#myQuery').append(self.act.get(addItem).hide().fadeIn());
      self.inUse[addItem] = true;
      
    },
    
    remove : function(removeItem) {
      
      self.act.get(removeItem).detach();
      self.inUse[removeItem] = false;
      
    },
    
    value : function(evaluateItem) {
      
      $.fn.evaluate = function(){
        var input = $(this);
        if (input.attr('type') == 'text')
          return input.val();
      }

      var group = self.groups[evaluateItem];

      if (group == null)
        return self.inputs[evaluateItem].evaluate();
      else {
        var values = [];

        var action = function(inputId) {
          values.push(self.inputs[inputId].evaluate());
        };

        self.act.onGroup(group, action);

        return values;
      }
        
    }
    
  };
  
  
  if (inputForm) self.make.from(inputForm);
}